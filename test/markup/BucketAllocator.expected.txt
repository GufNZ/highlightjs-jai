#import "Basic";
/*
	Jai Bucket Allocator
	====================

	Inspired by something Jon mentioned on a compiler stream about an allocator that can handle any type, but is not as complex as a full malloc implementation.
	This allocator has buckets of fixed-sized (power of 2) chunks of memory, and allocates from the smallest one to fit the requested size.
	The sizes available and the number of each is controled with the SIZES_CONFIG param - see below.  Everything is dynamically created off this config so there's no waste.

	It does not support create_/destroy_heap() nor is it yet tested for multithreading.

	It supports allocating, freeing, and also resizing:
		- If the new size still fits in the same sized bucket, nothing moves.
		- If the new size needs a larger bucket, a new allocation is made and the data copied into it.
		- If the new size fits in a smaller bucket, either nothing happens or a new allocation is made and the smaller size worth of data is copied, depending on HONOUR_REALLOC_SHRINK - see below.

	It also optionally records statistics that can then be printed, aiding in tuning the SIZES_CONFIG to your code's runtime needs, if you want to configure it as lean as needed for example.

	Allocations are managed via a free-list and used-list, which means freeing has an O(n) component at the moment.  Might consider bit arrays if this becomes a performance issue.

	Note that allignment is only ensured if the initial allocation of the BucketArray instance is also aligned.

	Module Parameters:
	------------------
		Currently none, tho I'm considering moving SIZES_CONFIG to be one instead of a Program Parameter.
		This would allow there to be multiple instances with different configs, rather than the current paradigm that expects there to only ever be one [configuration].

	Program Parameters:
	-------------------
		SIZES_CONFIG:
			This int array defines how many sizes of bucket there will be (by its length), as well as how many of each size there will be (by the values).
			The smallest bucket is for 16byte allocations, so the first entry in the array controls how many of those will exist.  The next entry, if it is present, is for 32byte allocations, etc.
			If an entry is 0 then that size will be excluded and allocations that would want that size will fail.
			As many buckets as non-zero entries will be created.
			Default is .[65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256] which will allocate 1MiB for each size from 16bytes to 4096bytes.

		USE_UNMAPPING_ALLOCATOR:
			Like other allocators, stomps freed memory with 0xCC if true, to aid in memory debugging.
			Defaults to false.

		HONOUR_REALLOC_SHRINK:
			If false, a realloc() that asks for less memory won't actually do anything, leaving the allocation where it is.
			If true, a shrink will cause a reallocation (if it would cause a difference in bucket size).
			Note that realloc()s that don't alter the bucket size the allocation is in, either grows or shrinks, will always be NOPs anyway, regardless of this parameter.

		RECORD_STATS:
			If true, we allocate a bit more RAM to hold usage stats and update them as things are allocated/reallocated/freed.
			It also defines print_stats(*BucketAllocator, compact=false) that can then print the stats.
			This is useful if you want to initialise to a configuration that allocates no more than it needs to for example.

		ALLOW_OVERFLOW:
			If true, an attempt to allocate what would go into a certain sized bucket is allowed to overflow to the next size up if there are no entries left.
			This continues until a successful allocation or we run out of sizes to try.
			Defaults to true.

	Example:
	--------
	The usual pattern for use would be something like:
		#import "Bucket_Allocator"()(SIZES_CONFIG = int.[10,10,10,10]);

		...

		newContext := context;
		newContext.allocator = make_bucket_allocator();
		push_context newContext {
			...do stuff using the new allocator, remembering that everything including print will then use it...
		}

	Or alternatively, using the push_allocator macro:
		...
		push_allocator(make_bucket_allocator());
		...do stuff using the new allocator, till the end of the current scope...

	API:
	----
		make_bucket_allocator() -> Allocator
			Allocates a BucketAllocator (via New()) and returns an Allocator struct configured to use it.

		free_bucket_allocator(Allocator)
			Frees the BucketAllocator configured in the supplied Allocator struct.
			Not expected to be needed much but is here for completeness.

		init(*BucketAllocator)
			For in case you want to create the BucketAllocator yourself but still need to initialise it.
			Note that this sets up the initial free-lists so is necessary to call before you can use the BucketAllocator instance; make_bucket_allocator() calls this for you.

		de_init(*BucketAllocator)
			Frees the supplied allocator by calling free() on it.
			Again, not expected to be needed much but is here for completeness.

		#if RECORD_STATS {
			print_stats(*BucketAllocator, compact=false)
				Prints either detailed or compact stats about the supplied BucketAllocator.
				Compact stats just print the used/total counts and a percentage full per bucket size.
		}

		bucket_allocator_proc(Allocator_Mode, s64, s64, *void, *void) -> *void
			The Allocator_Proc that drives the BucketAllocator.
			Not expected to be called directly, but rather via calls to alloc(s64[, *Allocator]), realloc(*void, s64, s64[, *Allocator]), free(*void[, *Allocator]), and get_capabilities(*Allocator).

//LATER: logging?, //MAYBE: extra storage when full (iff RECORD_STATS?)?
//QUESTION: allow underflow?  Probably means adding a setting for which to prefer.

*/

// Defaults are 1MiB each size.  Not sure if that makes sense yet.
//QUESTION: should SIZES_CONFIG be a module or a program param?
#module_parameters ()(
	SIZES_CONFIG : [$N]int = .[65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256],
	USE_UNMAPPING_ALLOCATOR := false,
	HONOUR_REALLOC_SHRINK := false,
	RECORD_STATS := false,
	ALLOW_OVERFLOW := true
);

bucket_allocator_proc :: (mode: Allocator_Mode, requested_size: s64, old_size: s64, old_memory: *void, allocator_data: *void) -> *void {
	bucketAllocator := cast(*BucketAllocator)allocator_data;

	if #complete mode == {
		case .ALLOCATE; #through;
		case .RESIZE;
			return allocate(bucketAllocator, mode, requested_size, old_size, old_memory);
		case .FREE;
			free(bucketAllocator, old_memory);
			#if USE_UNMAPPING_ALLOCATOR {
				assert((cast(*u8)old_memory).* == 0xCC, "Didn't wipe on free correctly!");
			}
			return null;

		case .STARTUP;	#through;
		case .SHUTDOWN;
			return null;

		case .THREAD_START;	#through;
		case .THREAD_STOP;
			assert(false, "Threading not supported [yet?].");

		case .CREATE_HEAP;	#through;
		case .DESTROY_HEAP;
			assert(false, "Heaps not supported.");

		case .IS_THIS_YOURS;
			return cast(*void) cast(s64) (findBucket(bucketAllocator, old_memory) > 0);

		case .CAPS;
			if old_memory {
				(cast(*string)old_memory).* = CAPS_VERSION_STRING;
			}
			return cast(*void)(Allocator_Caps.FREE|.ACTUALLY_RESIZE|.IS_THIS_YOURS);
	}

	assert(false, "unreachable");
	return null;
}

#if RECORD_STATS {
	print_stats :: (using bucketAllocator: *BucketAllocator, compact := false) {
		print("BucketAllocator @%\n", bucketAllocator);
		if (compact) {
			for 0..SIZES_CONFIG.count - 1 {
				#if ALLOW_OVERFLOW {
					print(
						"  %: %/% = %4%% (%)\n",
						formatInt(it + 4, minimum_digits=2),
						stats[it].highWaterMark,
						SIZES_CONFIG[it],
						(10000 * stats[it].highWaterMark / SIZES_CONFIG[it]) / 100.0,
						stats[it].overflows
					);
				} else {
					print(
						"  %: %/% = %4%%\n",
						formatInt(it + 4, minimum_digits=2),
						stats[it].highWaterMark,
						SIZES_CONFIG[it],
						(10000 * stats[it].highWaterMark / SIZES_CONFIG[it]) / 100.0
					);
				}
			}
		} else {
			baType: *Type_Info_Struct = xx type_info(BucketAllocator);
			for 0..SIZES_CONFIG.count - 1 {
				field := get_field(baType, tprint("size%Bucket", cleanFormat(it + 4)));
				print("  Size: % (%..%)\n", it + 4, bucketAllocator + field.offset_in_bytes, bucketAllocator + field.offset_in_bytes + field.type.runtime_size - 1);
				print("    Allocated : %\n", stats[it].allocated);
				print("    Freed     : %\n", stats[it].freed);
				print("    High Water: %\n", stats[it].highWaterMark);
				print("    LIMIT     : %\n", SIZES_CONFIG[it]);
				print("      %%       : %\n", (10000 * stats[it].highWaterMark / SIZES_CONFIG[it]) / 100.0);
				print("    Reallocate:\n");
				print("      Requested: %\n", stats[it].reallocateRequests);
				print("      NOPs     : %\n", stats[it].reallocateRequests - (stats[it].reallocateGrowsNeeded + stats[it].reallocateShrinksNeeded));
				print("      Grows    : %\n", stats[it].reallocateGrowsNeeded);
				#if HONOUR_REALLOC_SHRINK {
					print("      Shrinks  : %\n", stats[it].reallocateShrinksNeeded);
				}
				#if ALLOW_OVERFLOW {
					print("    Overflows: %\n", stats[it].overflows);
				}
			}
		}
	}
}

make_bucket_allocator :: () -> Allocator {
	ba := New(BucketAllocator);
	init(ba);
	return .{ proc = bucket_allocator_proc, data = xx ba };
}

free_bucket_allocator :: (a: Allocator) {
	assert(a.proc == bucket_allocator_proc && a.data, "Not a BucketAllocator!");
	ba: cast(*BucketAllocator) a.data;
	deInit(ba);
}

init :: (using bucketAllocator: *BucketAllocator) {
	assert(allocator.proc == null, "Already initialised!");
	assert(context.allocator.proc != bucket_allocator_proc, "Can't allocate off ourselves!");
	allocator = context.allocator;

	#insert #run generateSizeCalls("\tinitBucket(*size%Bucket);\n");
}

de_init :: (using bucketAllocator: *BucketAllocator) {
	free(bucketAllocator, allocator);
}

#scope_file

BucketSize :: #type,distinct u8;
OldBucketSize :: #type,isa BucketSize;

MAX_SIZE : BucketSize : SIZES_CONFIG.count + 3;

CAPS_VERSION_STRING :: "Bucket_Allocator v1.2";

initBucket :: (bucket: *BucketSet($S, $L)) {
	for < L - 1..0 {
		ref := *bucket.refs[it];
		ref.item = xx *bucket.items[it];
		ref.next = bucket.freeList;
		bucket.freeList = ref;
	}
	bucket.usedList = null;
}

#if HONOUR_REALLOC_SHRINK {
	reallocShouldNotMove :: (oldSize: OldBucketSize, size: BucketSize) -> bool {
		return oldSize == size;
	}
} else {
	reallocShouldNotMove :: (oldSize: OldBucketSize, size: BucketSize) -> bool {
		return oldSize >= size;
	}
}

allocate :: (using bucketAllocator: *BucketAllocator, mode: Allocator_Mode, requestedSize: s64, oldSize: s64, oldMemory: *void) -> *void {
	size := calculateSize(requestedSize);
	ref: *BucketItemRef;

	if mode == .RESIZE {
		oldSize, oldRef := findBucket(bucketAllocator, oldMemory, requestedSize);
		assert(oldSize > 0, "Not our memory!");
		#if RECORD_STATS {
			index := size - 4;
			stats[index].reallocateRequests += 1;
		}

		if reallocShouldNotMove(oldSize, size) {
			return oldMemory;
		}


		#if RECORD_STATS {
			if oldSize < size {
				stats[index].reallocateGrowsNeeded += 1;
			} else {
				stats[index].reallocateShrinksNeeded += 1;
			}
		}
		ref = doAllocateNew(bucketAllocator, size);

		memcpy(ref.item, oldRef.item, 1<<min(size, oldSize));	// @Speed: if the requested size lots smaller than bucket's size we are copying more than we need.  Not sure we care.
	} else {
		ref = doAllocateNew(bucketAllocator, size);
	}

	return ifx ref  ref.item else null;
}

#if ALLOW_OVERFLOW {
	doAllocateNew :: inline (bucketAllocator: *BucketAllocator, size: BucketSize) -> *BucketItemRef {
		ref := allocateNew(bucketAllocator, size);
		if ref  return ref;


		origSize := size;
		while !ref && size < MAX_SIZE {
			size += 1;
			ref = allocateNew(bucketAllocator, size);
		}

		if ref {
			log("BucketAllocator: Overflowed allocation of BucketSize % into size %!", origSize, size, flags = .WARNING);
			#if RECORD_STATS {
				for origSize - 4..size - 5 {
					bucketAllocator.stats[it].overflows += 1;
				}
			}
		}
		return ref;
	}
} else {
	doAllocateNew :: inline (bucketAllocator: *BucketAllocator, size: BucketSize) -> *BucketItemRef {
		return allocateNew(bucketAllocator, size);
	}
}

calculateSize :: (requestedSize: s64) -> BucketSize {
	assert(requestedSize > 0, ifx requestedSize then "Can't allocate negative size!" else "Can't allocate 0 size!");
	//TODO: #asm to find the top bit...
	size : BucketSize = 4;
	length := 1<<size;
	while length < requestedSize {
		size += 1;
		length <<= 1;
	}

	return size;
}

allocateNew :: inline (using bucketAllocator: *BucketAllocator, size: BucketSize) -> *BucketItemRef {
	#insert #run generateSizeCalls(
		preamble="\tif size == {\n",
		format="\t\tcase %1;\n\t\t\treturn allocateNew(bucketAllocator, *size%1Bucket);\n",
		postamble="\n\t\tcase;\n\t\t\tassert(false, \"Bad size %%!\", size);\n\t\t\treturn null;\n\t}\n"
	);
}

allocateNew :: (using bucketAllocator: *BucketAllocator, bucket: *BucketSet($S, $L)) -> *BucketItemRef {
	#if RECORD_STATS {
		index :: S - 4;
		stats[index].allocated += 1;
		mark := stats[index].allocated - stats[index].freed;
		if mark > stats[index].highWaterMark {
			stats[index].highWaterMark = mark;
		}
	}

	ref := bucket.freeList;
	if !ref {
		return null;
	}


	bucket.freeList = ref.next;
	ref.next = bucket.usedList;
	bucket.usedList = ref;

	return ref;
}

free :: (using bucketAllocator: *BucketAllocator, oldMemory: *void) {
	oldSize := findBucket(bucketAllocator, oldMemory, -1);
	assert(oldSize > 0, "Not our memory!");
	#if RECORD_STATS {
		stats[oldSize - 4].freed += 1;
	}
}

findBucket :: (using bucketAllocator: *BucketAllocator, memory: *void, newSize: int = 0) -> OldBucketSize, *BucketItemRef {
	testBucket :: (memory: *void, bucket: *BucketSet($S, $L)) #expand {
		itemSize :: 1 << S;
		offset : s64 = cast(s64) memory - cast(s64) *bucket.items[0];
		inside := offset >= 0 && offset < itemSize * SIZES_CONFIG[S - 4];
		if (inside) {
			ref: *BucketItemRef;
			assert(offset % itemSize == 0, "Don't free the middle of an item!");
			if (`newSize < 0 || !reallocShouldNotMove(S, calculateSize(`newSize))) {
				ref = unallocateRef(bucket, memory);
			}

			`return S, ref;
		}
	}

	#insert #run generateSizeCalls("\ttestBucket(memory, *size%Bucket);\n");

	return 0, null;
}

unallocateRef :: (using bucket: *BucketSet($S, $L), memory: *void) -> *BucketItemRef {
	//NOTE: @Speed: finding the allocated bucket is O(n)...
	prev: *BucketItemRef;
	ref := usedList;

	assert(ref != null, "Nothing allocated here!");
	while (ref && memory != xx ref.item) {
		prev = ref;
		ref = ref.next;
	}
	assert(ref != null, "Didn't find the ref!");

	if prev {
		prev.next = ref.next;
	} else {
		usedList = ref.next;
	}

	ref.next = freeList;
	freeList = ref;

	#if USE_UNMAPPING_ALLOCATOR {
		memset(ref.item, 0xCC, 1<<S);
	}

	return ref;
}

cleanFormat :: inline (value: int) -> FormatInt {
	// Just in case the caller has modified the default print_style in a way that might break the generated code, reset it:
	return .{value=value};
}

generateSizeCalls :: (format: string, preamble := "", postamble := "") -> string {
	builder: String_Builder;
	size : BucketSize = 4;

	print_to_builder(*builder, preamble);

	for SIZES_CONFIG {
		if it {
			print_to_builder(*builder, format, cleanFormat(xx size));
		}
		size += 1;
	}

	print_to_builder(*builder, postamble);

	return builder_to_string(*builder);
}

generateSizeFields :: (format: string) -> string {
	builder: String_Builder;
	size : BucketSize = 4;

	for SIZES_CONFIG {
		if it {
			print_to_builder(*builder, format, cleanFormat(xx size), cleanFormat(it));
		}
		size += 1;
	}

	return builder_to_string(*builder);
}

#scope_export

BucketAllocator :: struct {
	#as allocator: Allocator;

	#insert #run generateSizeFields("\tsize%1Bucket: BucketSet(size = %1, length = %2);\n");

	#if RECORD_STATS {
		stats: [SIZES_CONFIG.count] BucketStats;
	}
}

BucketSet :: struct(size: int, length: int) {
	items: [length] [1 << size] u8;
	refs: [length] BucketItemRef;
	freeList: *BucketItemRef;
	usedList: *BucketItemRef;
}

BucketItemRef :: struct {
	item: *u8;
	next: *BucketItemRef;
}

#if RECORD_STATS {
	BucketStats :: struct {
		allocated: int;
		reallocateRequests: int;
		reallocateGrowsNeeded: int;
		#if HONOUR_REALLOC_SHRINK {
			reallocateShrinksNeeded: int;
		}
		freed: int;
		highWaterMark: int;
		#if ALLOW_OVERFLOW {
			overflows: int;
		}
	}
}

_FACD3D11 :: 0x87c;

_FACD3D11DEBUG :: ( _FACD3D11 + 1 );

MASK0: u8 : (0b1111 << 4);
Holder :: struct ($T: Type, $N: s64) {
	array: [N] T;
}
hello2 :: (p: *[..] *Holder) {
	print("p.* is %\n", p.*);
}

bake_probe :: ($T: Type, $$N: s64, value: $T) {
}
#if OS == .LINUX {
	a := 1;
	Str::struct {
		value: [5] u8;
	};
}

Abc :: struct {
	A :: 1;
	b: string;
	#if OS == .LINUX {
		c: int;
	}
}
#import "Basic";
main :: () {}

Popup_Info :: struct {
    proc:   (*void) -> ();
    data:   *void;
    z:      s32;
    serial: s32;
}

add_popup :: (proc: (*void) -> (), data: *void, z: s32) {
    info := array_add(*popups);
    info.proc   = proc;
    info.data   = data;
    info.z      = z;
    info.serial = cast(s32)popups.count;
}
popups:     [..] Popup_Info;        // This gets reset every frame. Popups must be recreated every frame to stay around.
copy_4_u64_256_asm :: (destination: *void, source: *void, count: s64) {
    Chunk :: struct { u64s: [4] u64; };
    d : *Chunk = destination;  s : *Chunk = source;
    chunk_count := count / size_of(Chunk);

    remainder_byte_offset := chunk_count * size_of(Chunk);
    remainder_byte_count := count - remainder_byte_offset;
    d_remainder : *u8 = destination + remainder_byte_offset;
    s_remainder : *u8 = source + remainder_byte_offset;

    overlapping := destination > source && destination < source + count;
    if !overlapping {
        for 0 .. chunk_count - 1 {
            d_chunk := *d[it];  s_chunk := *s[it];
            #if CPU == .X64 {
                #asm {
                    mov.q t0:, [s_chunk +  0];
                    mov.q t1:, [s_chunk +  8];
                    mov.q t2:, [s_chunk + 16];
                    mov.q t3:, [s_chunk + 24];
                    mov.q [d_chunk +  0], t0;
                    mov.q [d_chunk +  8], t1;
                    mov.q [d_chunk + 16], t2;
                    mov.q [d_chunk + 24], t3;
                }
            } else {
                d_chunk.u64s[0] = s_chunk.u64s[0];
                d_chunk.u64s[1] = s_chunk.u64s[1];
                d_chunk.u64s[2] = s_chunk.u64s[2];
                d_chunk.u64s[3] = s_chunk.u64s[3];
            }
        }

        for 0 .. remainder_byte_count - 1
            d_remainder[it] = s_remainder[it];

    } else {
        for < 0 .. remainder_byte_count - 1
            d_remainder[it] = s_remainder[it];

        for < 0 .. chunk_count - 1 {
            d_chunk := *d[it];  s_chunk := *s[it];
            #if CPU == .X64 {
                #asm {
                    mov.q t0:, [s_chunk +  0];
                    mov.q t1:, [s_chunk +  8];
                    mov.q t2:, [s_chunk + 16];
                    mov.q t3:, [s_chunk + 24];
                    mov.q [d_chunk +  0], t0;
                    mov.q [d_chunk +  8], t1;
                    mov.q [d_chunk + 16], t2;
                    mov.q [d_chunk + 24], t3;
                }
            } else {
                d_chunk.u64s[3] = s_chunk.u64s[3];
                d_chunk.u64s[2] = s_chunk.u64s[2];
                d_chunk.u64s[1] = s_chunk.u64s[1];
                d_chunk.u64s[0] = s_chunk.u64s[0];
            }
        }
    }
}

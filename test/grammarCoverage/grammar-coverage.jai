#!/usr/bin/env jai

_FACD3D11 :: 0x87c;

_FACD3D11DEBUG :: ( _FACD3D11 + 1 );

// Original, distributable syntax fixture.  No source is copied from the Jai repository.
// TODO: Exercise line-comment tags. @Fixme @Bug @Hack @Maybe @Question @Speed
/* NOTE: Exercise a nested block comment. /* inner */ @Cleanup @Incomplete */

Coverage_Module :: #import "Grammar_Coverage_Module"(FEATURE = true, SAMPLE_LIMIT = 3)(PROGRAM_FEATURE_ENABLED = false);
#import "Basic";

// Workspace: Synthetic Coverage Workspace
// String added via add_build_string() from synthetic/input.jai:12.
// #insert text.  Generated from synthetic/input.jai:34.

HERE_TEXT :: #string END_TEXT
Original here-string text with a % substitution marker.
END_TEXT

CHAR_NEWLINE :: #char "\n";
CHAR_ASCII   :: #char "A";

BINARY_VALUE    :: 0b1010_0101;
HEX_VALUE       :: 0xCAFE_BABE;
HEX_FLOAT_VALUE :: 0h3f80_0000;
UPPER_BINARY_VALUE    :: 0B1010_0101;
UPPER_HEX_VALUE       :: 0XCAFE_BABE;
UPPER_HEX_FLOAT_VALUE :: 0H3f80_0000;
FLOAT_VALUE     :: 1.25e-3;
INTEGER_VALUE   :: 1_000_000;
STRING_VALUE    :: "quotes: \" slash: \\ tab: \t unicode: \u0041";
MASK_SHIFT: u8 : (0b1111 << 4);
Explicit_Proc_Type: Type : #type (value: int) -> int;

f32 :: float32;
f64 :: float64;

Signed_Alias   :: #type,distinct s64;
Inherited_Int :: #type,isa Signed_Alias;

Primitive_Record :: struct {
	a: u8; b: u16; c: u32; d: u64;
	e: s8; f: s16; g: s32; h: s64;
	i: int; j: float; k: float32; l: float64; m: f32; n: f64;
	enabled: bool; text: string; opaque: *void;
	fixed: [4] int;
	dynamic: [..] int;
	view: [] int;
	callback: #type (value: int) -> (result: int, ok: bool);
	nested: struct { value: int; };
	choice: union { integer: int; real: float64; };
	DEFAULT_VALUE :: 7;
}

Generic_Record :: struct (T: Type, count: int = 2) {
	values: [count] T;
}

Plain_Union :: union {
	integer: s64;
	real: float64;
}

Payload_Kind :: enum {
	NONE;
	INTEGER;
	TEXT;
}

Payload :: union kind: Payload_Kind = .NONE {
	.NONE    ,, empty: void;
	.INTEGER ,, integer: s64;
	.TEXT    ,, text := "default";
}

Integer_Tagged_Union :: union tag: s64 {
}

Type_Tagged_Union :: union tag: Type {
}

Access_Flags :: enum_flags u32 {
	READ;
	WRITE;
	EXECUTE;
}

Base_Record :: struct { value: int; }
Cast_Word :: struct { value: u64; }
Cast_Pair :: struct { low: u32; high: u32; }
Cast_Byte :: struct { value: u8; }
Derived_Record :: struct {
	#as base: Base_Record;
	using options: struct {
		retries: int;
		storage: union { small: u32; large: u64; };
	};
}

add_numbers :: (left: int, right: int) -> int {
	return left + right;
}

fixture_print :: (format: string, arguments: .. Any) {
}

operator + :: (left: Base_Record, right: Base_Record) -> Base_Record {
	return .{ value = left.value + right.value };
}

optional_bake :: ($$amount: int) -> int {
	return ifx amount then amount else 1;
}

generic_identity :: (value: $T) -> T {
	return value;
}

repeat_value :: (value: $T, $count: int) -> [count] T {
	result: [count] T;
	for 0..count-1 result[it] = value;
	return result;
}

consume_many :: (first: int, rest: .. Any, location := #caller_location) -> (sum: int = 0, ok := true) {
	return first, true;
}

Transform_Proc :: #type (value: int) -> int;

// Normal procedure declarations: parameter and return-shape permutations.
proc_params_empty :: () {}
proc_params_named :: (value: int) {}
proc_params_defaulted :: (value: int = 1) {}

proc_returns_absent :: () {}
proc_returns_empty :: () -> () {}
proc_returns_unnamed :: () -> int { return 1; }
proc_returns_named :: () -> (result: int) { return 1; }
proc_returns_defaulted :: () -> (result: int = 1) { return 1; }

// Procedure types as values: each shape without and with an assigned default value.
proc_value_params_empty: ();
proc_value_params_empty_defaulted: () = proc_params_empty;
proc_value_params_unnamed: (int);
proc_value_params_unnamed_defaulted: (int) = proc_params_named;
proc_value_params_named: (value: int);
proc_value_params_named_defaulted: (value: int) = proc_params_named;
proc_value_params_inner_default: (value: int = 1);
proc_value_params_inner_and_outer_default: (value: int = 1) = proc_params_defaulted;

proc_value_returns_absent: ();
proc_value_returns_absent_defaulted: () = proc_returns_absent;
proc_value_returns_empty: () -> ();
proc_value_returns_empty_defaulted: () -> () = proc_returns_empty;
proc_value_returns_unnamed: () -> int;
proc_value_returns_unnamed_defaulted: () -> int = proc_returns_unnamed;
proc_value_returns_named: () -> (result: int);
proc_value_returns_named_defaulted: () -> (result: int) = proc_returns_named;
proc_value_returns_inner_default: () -> (result: int = 1);
proc_value_returns_inner_and_outer_default: () -> (result: int = 1) = proc_returns_defaulted;

apply_transform :: (transform: Transform_Proc, value: int) -> int {
	return transform(value);
}

context_call :: (value: int) -> int {
	return value;
}

procedure_types :: (
	transform: Transform_Proc,
	nested: #type (callback: #type (item: int) -> bool) -> (accepted: bool)
) -> Transform_Proc {
	return transform;
}

for_expansion :: (values: *[] int, body: Code, flags: For_Flags) #expand {
	for value, index: values.* {
		`it := value;
		`it_index := index;
		#insert body;
	}
}

exercise_control_flow :: (values: [] int) -> int {
	total := 0;
	defer total += 1;
	for values {
		total += it + it_index;
	}
	for *value, index: values {
		if index == 0 continue;
		total += value.*;
		if total > 100 break;
	}
	while total < 10 {
		total += 1;
	}
	if total == {
		case 0; total = 1; #through;
		case 1; total = 2;
		case; total = 3;
	}
	return total;
}

exercise_expressions :: (left: int, right: int, pointer: *int) {
	arithmetic := left + right - left * right / 2 % 3;
	comparisons := left == right || left != right || left <= right || left >= right;
	bits := (left & right) | (left ^ right);
	bits = ~bits;
	bits <<= 1;
	bits >>= 1;
	rotated_left := bits <<< 3;
	rotated_right := bits >>> 2;
	small_shift := bits <<,small 1;
	logical_shift := bits >>,logical 1;
	dereferenced := pointer.*;
	pointer.* = arithmetic;
	uninitialised: int = ---;
	inferred: [3] int = .[1, 2, 3];
	typed := int.[4, 5, 6];
	record := Base_Record.{ value = 7 };
	field := record.value;
	constant := Payload_Kind.INTEGER;
}

exercise_casts :: (pointer: *void, value: s64) {
	automatic := xx pointer;
	automatic_truncated: s32 = xx,trunc value;
	automatic_unchecked: s32 = xx,no_check value;
	checked := cast(*u8) pointer;
	unchecked := cast,no_check(*u8) pointer;
	truncated := cast,trunc(s32) value;
	source := Cast_Word.{value = cast(u64) value};
	small_source := Cast_Byte.{value = cast,trunc(u8) value};
	forced := cast,force(Cast_Pair) source;
	force_larger := cast,FORCE(Cast_Word) small_source;
	modern := cast(s32, value);
	modern_truncated := cast(s32, value, trunc);
	modern_unchecked := cast(s32, value, no_check);
	modern_forced := cast(Cast_Pair, source, force);
	modern_force_larger := cast(Cast_Word, small_source, FORCE);
	modern_auto := xx(value);
	suffix_checked := value.(s32);
	suffix_truncated := value.(s32, trunc);
	suffix_unchecked := value.(s32, no_check);
	suffix_forced := source.(Cast_Pair, force);
	suffix_force_larger := small_source.(Cast_Word, FORCE);
	nested_type := cast(*Generic_Record(int, 2)) pointer;
}

exercise_calls :: (values: [] int) {
	fixture_print("value %1 and %%", values.count);
	mapped := values[0];
	mapped = apply_transform(entry => entry + 1, mapped);
	context_call(mapped,, temp);
	for :for_expansion values {
		mapped += it + it_index;
	}
}

exercise_asm :: (source: *u8) -> s64 {
	BITS :: 64;
	result: s64 = 0;
	#asm FPU, AVX2 {
		pinned: gpr === a;
		mov.64 result, 7;
		mov.64 result, [source + 16];
		mov pinned, result;
		popcnt?BITS result, pinned;
	}
	return result;
}

#if false {
	Synthetic_Library :: #library,no_dll,link_always "synthetic-library";
	System_Library :: #system_library "synthetic-system-library";
	external_name :: () #foreign Synthetic_Library "external_symbol";
	elsewhere_name :: () #elsewhere Synthetic_Library;
	Loaded_Text :: #import,file "synthetic-file.jai";
	Loaded_Directory :: #import,dir "synthetic-directory";
	#load "synthetic-load.jai";

	Inserted_Constant :: #insert -> string { return "1;"; }
	modified_procedure :: (value: int) -> $Result
	#modify {
		Result = int;
		return true;
	} {
		return value;
	}
}

main :: () {
	values := int.[1, 2, 3];
	result := exercise_control_flow(values);
	exercise_expressions(result, 2, *result);
	exercise_casts(cast(*void) *result, result);
	module_value := Coverage_Module.module_identity(result);
}

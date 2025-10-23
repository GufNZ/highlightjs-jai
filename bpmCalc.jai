#import "Basic";
#import "Windows";

kernel32 :: #system_library "kernel32";

stdin, stdout  : HANDLE;

ReadConsoleA  :: (
	hConsoleHandle: HANDLE,
	buff : *u8,
	chars_to_read : s32,
	chars_read : *s32,
	lpInputControl := *void
) -> bool #foreign kernel32;

input :: () -> string {
	MAX_BYTES_TO_READ :: 1024;
	temp : [MAX_BYTES_TO_READ] u8;
	result: string = ---;
	bytes_read : s32;

	if !ReadConsoleA( stdin, temp.data, xx temp.count, *bytes_read )
		return "";

	result.data  = alloc(bytes_read);
	result.count = bytes_read;
	memcpy(result.data, temp.data, bytes_read);
	return result;
}

main :: () {
	stdin = GetStdHandle( STD_INPUT_HANDLE );
	print("start> ");
	str := input();
	start := current_time_consensus();
	now := start + to_s128(1);
	n := 0;
	while str == "\r\n" {
		mins := to_nanoseconds(now - start) / 60_000_000_000.0;
		#if 0 {
		print("% bpm; % / %> ", FormatFloat.{value=n / mins, trailing_width=3, zero_removal=.NO}, n, FormatFloat.{value=mins, trailing_width=3, zero_removal=.NO});
		} else {
		print("% bpm> ", FormatFloat.{value=n / mins, trailing_width=3, zero_removal=.NO});
		}
		n += 1;
		str = input();
		now = current_time_consensus();
	}
}

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

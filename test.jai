Item :: struct {
	Item :: struct {
		x: int;
	}
	Y :: struct { }
	Z :: struct {
		a: int;
		b :: struct {
			c: float;
		}
	}
}

foo :: struct {
	bar := struct { x: int; }
	baz : Foo = .{ 1, 2 }
}

nested :: (x: int) -> Nested_Type {
	Result :: struct { value: int; }
	return .{ x };
}

setup_xr :: () -> app: Xr_App = .{}, success := false {
    // ...
}

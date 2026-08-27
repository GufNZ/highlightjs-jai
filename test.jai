Holder :: struct ($T: Type, $N: s64) {
	array: [N] T;
}
hello2 :: (p: *[..] *Holder) {
	print("p.* is %\n", p.*);
}

bake_probe :: ($T: Type, $$N: s64, value: $T) {
}

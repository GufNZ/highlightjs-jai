// Original module fixture for module-parameter highlighting.
#module_parameters (FEATURE := true, SAMPLE_LIMIT: int = 4) (PROGRAM_FEATURE_ENABLED := true) {
	Module_Callback :: #type (value: int) -> int;
}

Module_Mode :: enum_flags u8 {
	READ;
	WRITE;
}

Module_Record :: struct (T: Type, count: int = SAMPLE_LIMIT) {
	values: [count] T;
	mode: Module_Mode = .READ;
}

module_identity :: inline (value: $T) -> T {
	return value;
}

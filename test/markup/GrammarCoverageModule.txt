// Original module fixture for module-parameter highlighting.
#module_parameters (PROGRAM_FEATURE := true) (FEATURE_ENABLED := true, SAMPLE_LIMIT: int = 4) {
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

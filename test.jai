SIQuantityTypeParams :: struct {
	#insert -> string {
		sb: String_Builder;

		ti := type_info(SIQuantity(int,0,0,0,0,0,0,0,0,0)).(*Type_Info_Struct);
		for ti.specified_parameters {
			print(*sb, "\t%: %;\t// @ %\n", it.name, get_type(it.type), it.offset_into_constant_storage);
		}

		print(*sb, "\n\tlastSet : enum { NONE; LENGTH; TIME; MASS; };\n");

		return builder_to_string(*sb);
	}
}

getSIParameters :: (t: Type) -> SIQuantityTypeParams {
	ti := t.(*Type_Info_Struct);
	tp := type_info(SIQuantityTypeParams);

	p: SIQuantityTypeParams;

	q := (*p).(*u64);
	s := ti.constant_storage.data.(*u64);

	for param: ti.specified_parameters {
		for tp.members {
			if it.name == param.name/* && it.type == param.type*/ {
				q[it.offset_in_bytes >> 3] = s[param.offset_into_constant_storage >> 3];
				break;
			}
		}
	}

	return p;
}

multiReturn :: (a: int, b: int) -> int, string, bool {
	return a + b, "hi", true;
}

namedReturns :: (x: float) -> (sum: float, ok: bool) {
	return x + 1.0, true;
}

singleReturn :: (n: int) -> string { return "x"; }

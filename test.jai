calc_ballistic_range :: (
	speed: MetersPerSecond(float),
	gravity: MetersPerSecond2(float),
	initial_height: Meters(float)
) -> Meters(float)
{
	assert(speed.amount > 0.0);
	assert(gravity.amount > 0.0);
	assert(initial_height.amount >= 0.0);

	d2r : float: cast(float)0.01745329252;
	angle : float: 45.0 * d2r;
	ang_cos := cos(angle);
	ang_sin := sin(angle);

	range : Meters(float) = (speed * ang_cos / gravity)
	   * (speed * ang_sin + sqrt(speed * speed * ang_sin * ang_sin + 2.0 * gravity * initial_height));
	return range;
}

calc_ballistic_range2 :: (
	speed: $T/SIQuantity,
	gravity: $U/SIQuantity,
	initial_height: $V/SIQuantity
) -> $R
#modify {
	p := getSIParameters(T);

	R = #dynamic_specialize SIQuantity(
		DataType=p.DataType,
		LengthNum=p.LengthNum, LengthDenom=p.LengthDenom, LengthExp=1,
		MassNum=0, MassDenom=0, MassExp=0,
		TimeNum=0, TimeDenom=0, TimeExp=0
	);
	return true;
} {
	#assert T.LengthExp == 1 && T.MassExp == 0 && T.TimeExp == -1;
	#assert U.LengthExp == 1 && U.MassExp == 0 && U.TimeExp == -2;
	#assert V.LengthExp == 1 && V.MassExp == 0 && V.TimeExp == 0;

	assert(speed.amount > 0.0);
	assert(gravity.amount > 0.0);
	assert(initial_height.amount >= 0.0);

	d2r : speed.DataType: xx 0.01745329252;
	angle :: 45.0 * d2r;
	ang_cos := cos(angle);
	ang_sin := sin(angle);

	range := (speed * ang_cos / gravity)
		* (
			speed * ang_sin + sqrt(speed * speed * ang_sin * ang_sin + 2.0 * gravity * initial_height)
		);
	return range;
}

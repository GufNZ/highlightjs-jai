#import "Basic"()(MEMORY_DEBUGGER = true);
#load "module.jai";

JSON :: #string END
{
	"errors": true,
	"items": [
END;

m :: (pp := SIQuantityTypeParams.{}, mod: (q: SIQuantityTypeParams) -> SIQuantityTypeParams = null) -> SIQuantityTypeParams {
	p := pp;
	p.LengthNum = 1;
	p.LengthDenom = 1;
	p.LengthExp = 1;
	p.lastSet = .LENGTH;
	if mod {
		p = mod(p);
	}
	return p;
}

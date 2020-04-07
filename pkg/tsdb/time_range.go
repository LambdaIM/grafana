package tsdb

import (
	"strconv"
	"strings"
	"time"

	"github.com/timberio/go-datemath"
)

func NewTimeRange(from, to string) *TimeRange {
	return &TimeRange{
		From: from,
		To:   to,
		now:  time.Now(),
	}
}

func NewFakeTimeRange(from, to string, now time.Time) *TimeRange {
	return &TimeRange{
		From: from,
		To:   to,
		now:  now,
	}
}

type TimeRange struct {
	From string
	To   string
	now  time.Time
}

func (tr *TimeRange) GetFromAsMsEpoch() int64 {
	return tr.MustGetFrom().UnixNano() / int64(time.Millisecond)
}

func (tr *TimeRange) GetFromAsSecondsEpoch() int64 {
	return tr.GetFromAsMsEpoch() / 1000
}

func (tr *TimeRange) GetFromAsTimeUTC() time.Time {
	return tr.MustGetFrom().UTC()
}

func (tr *TimeRange) GetToAsMsEpoch() int64 {
	return tr.MustGetTo().UnixNano() / int64(time.Millisecond)
}

func (tr *TimeRange) GetToAsSecondsEpoch() int64 {
	return tr.GetToAsMsEpoch() / 1000
}

func (tr *TimeRange) GetToAsTimeUTC() time.Time {
	return tr.MustGetTo().UTC()
}

func (tr *TimeRange) MustGetFrom() time.Time {
	res, err := tr.ParseFrom()
	if err != nil {
		return time.Unix(0, 0)
	}
	return res
}

func (tr *TimeRange) MustGetTo() time.Time {
	res, err := tr.ParseTo()
	if err != nil {
		return time.Unix(0, 0)
	}
	return res
}

func tryParseUnixMsEpoch(val string) (time.Time, bool) {
	if val, err := strconv.ParseInt(val, 10, 64); err == nil {
		seconds := val / 1000
		nano := (val - seconds*1000) * 1000000
		return time.Unix(seconds, nano), true
	}
	return time.Time{}, false
}

func (tr *TimeRange) ParseFrom() (time.Time, error) {
	return parse(tr.From, tr.now, false)
}

func (tr *TimeRange) ParseTo() (time.Time, error) {
	return parse(tr.To, tr.now, true)
}

func parse(s string, now time.Time, withRoundUp bool) (time.Time, error) {
	if res, ok := tryParseUnixMsEpoch(s); ok {
		return res, nil
	}

	withoutNow := strings.Replace(s, "now-", "", 1)

	diff, err := time.ParseDuration("-" + withoutNow)
	if err != nil {
		return datemath.ParseAndEvaluate(s, datemath.WithNow(now), datemath.WithRoundUp(withRoundUp))
	}

	return now.Add(diff), nil
}

// EpochPrecisionToMs converts epoch precision to millisecond, if needed.
// Only seconds to milliseconds supported right now
func EpochPrecisionToMs(value float64) float64 {
	s := strconv.FormatFloat(value, 'e', -1, 64)
	if strings.HasSuffix(s, "e+09") {
		return value * float64(1e3)
	}

	if strings.HasSuffix(s, "e+18") {
		return value / float64(time.Millisecond)
	}

	return value
}

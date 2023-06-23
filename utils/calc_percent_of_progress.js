export default function calcPercentOfProgress(countOfSuccess, countOfFailure) {
  return Math.round((countOfSuccess / (countOfSuccess + countOfFailure)) * 100);
}

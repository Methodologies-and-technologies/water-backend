/**
 *
 * @interface
 */
export interface CalculateOrderResponse {
  readonly amount: number;
  readonly discount: number;
  readonly deliveryCost: number;
  readonly totalSum: number;
}

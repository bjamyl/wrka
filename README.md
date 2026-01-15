# 
How to Pay Handymen via MoMo

 Currently your setup creates withdrawal records with status: 'pending'. Here are the options for actually disbursing funds:

 Option 1: Manual Processing (Simple, good for starting out)

 1. Admin views pending withdrawals in a dashboard (or directly in Supabase)
 2. Admin manually sends money via MTN MoMo, Vodafone Cash, or AirtelTigo Money
 3. Admin updates the withdrawal record: status: 'completed', processed_at: now()
 4. Optionally deduct from handyman_balances.available_balance via a database trigger or manually

 Option 2: Integrate a Payment API (Automated)

 Ghana has several payment providers that offer disbursement APIs:

 | Provider     | API                                  | Notes                                       |
 |--------------|--------------------------------------|---------------------------------------------|
 | Paystack     | https://paystack.com/docs/transfers/ | Popular, supports MTN, Vodafone, AirtelTigo |
 | Hubtel       | https://developers.hubtel.com/       | Ghana-focused                               |
 | Zeepay       | Disbursement API                     | Good for bulk payouts                       |
 | MTN MoMo API | https://momodeveloper.mtn.com/       | Direct, but MTN only                        |

 Typical flow with Paystack:
 1. Handyman requests withdrawal → creates pending record
 2. Backend calls Paystack Transfer API with momo_number + momo_provider
 3. Paystack webhook confirms success/failure
 4. Update withdrawal status + deduct balance

 Recommendation

 Start with Option 1 (manual) to validate the business, then integrate Paystack when volume justifies it. Paystack is well-documented and handles all three MoMo providers in Ghana.

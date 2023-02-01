# This is Backend using Node, for checking transfer transaction.
 
## Install node packages:
### npm install

## Running server:
### npm start

## You can test APIs with postman. 

### - Buy USDT
api address : http://localhost:8080/api/router/buy
```
Request Body: 
{
    receive_address : "",
    receive_amount : "",
    user_info : "",
} 
```
### - Example
```
Request Body:
    {
        user_info:smallbaby102@outlook.com
        receive_address:0x7cbEaa70Fa87622cC20A54aC7Cd88Bd008492e47
        receive_amount:5
    }; 
  
Result: 
{
    "success": true,
    "message": "Success",
    "data": {
        "order": {
            "type": "BUY",
            "code": "POBQ7JW8VEJ8",
            "receive_address": "0x7cbEaa70Fa87622cC20A54aC7Cd88Bd008492e47",
            "receive_chain": "BEP20",
            "receive_coin": "USDT",
            "receive_amount": "5.0000000000",
            "amount": "122150.0000000000",
            "rate": "24430.0000000000",
            "user_info": "smallbaby102@outlook.com",
            "txn_hash_link": "",
            "status": "PROCESSING",
            "confirm": "",
            "refer_code": null,
            "refer_order": null,
            "status_text": "Đợi chuyển tiền",
            "created_at": "2022-10-10T00:49:35.000000Z",
            "expire_at": "2022-10-10 08:04:35",
            "listBank": [
                {
                    "id": "VBNELPR4",
                    "name": "BIDV - NH Dau Tu va Phat Trien VN",
                    "code": "BIDV",
                    "image_url": "https://storage.googleapis.com/npay/default/0/0/0/3/9s/bidv-1651200376.jpg",
                    "branch_name": "Tây Hồ",
                    "account_no": "21210001039348",
                    "account_name": "CTY CP 9PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=VBNELPR4&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "DKZYENER",
                    "name": "VIETCOMBANK - NH Ngoai Thuong Viet Nam",
                    "code": "VIETCOMBANK",
                    "image_url": "https://storage.googleapis.com/npay/vietcombank-1-1587639971.png",
                    "branch_name": "Thành Công",
                    "account_no": "1018795282",
                    "account_name": "CT CP 9PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=DKZYENER&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "GYP50Z6O",
                    "name": "TPBANK - NH Tien Phong",
                    "code": "TPBANK",
                    "image_url": "https://storage.googleapis.com/npay/default/0/0/0/8/9s/download-1611822959-1612549305.jpeg",
                    "branch_name": "Thăng Long",
                    "account_no": "04139169201",
                    "account_name": "CONG TY CO PHAN 9PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=GYP50Z6O&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "M0ZO33PQ",
                    "name": "TECHCOMBANK - NH Ky Thuong",
                    "code": "TECHCOMBANK",
                    "image_url": "https://storage.googleapis.com/npay/techcombank-1587701721.png",
                    "branch_name": "Đông Đô",
                    "account_no": "19035002190027",
                    "account_name": "CTCP 9 PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=M0ZO33PQ&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "WBP84NRJ",
                    "name": "VIETINBANK - NH Cong Thuong VN",
                    "code": "VIETINBANK",
                    "image_url": "https://storage.googleapis.com/npay/vietinbank-1587639604.png",
                    "branch_name": "Thanh Xuân",
                    "account_no": "110002873172",
                    "account_name": "CONG TY CO PHAN 9PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=WBP84NRJ&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "KVPJRENE",
                    "name": "MBBANK - NH Quan Doi",
                    "code": "MBBANK",
                    "image_url": "https://storage.googleapis.com/npay/mb-1587639674.png",
                    "branch_name": "Sở giao dịch 3",
                    "account_no": "2341188899999",
                    "account_name": "9PAY JSC.,",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=KVPJRENE&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "DKZY7EPE",
                    "name": "VIB - NH Quoc Te",
                    "code": "VIB",
                    "image_url": "https://storage.googleapis.com/npay/default/0/0/0/30/9s/unnamed-1611823024.png",
                    "branch_name": "Đống Đa",
                    "account_no": "005429934",
                    "account_name": "9PAY JSC.,",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=DKZY7EPE&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "BKZ6LBNJ",
                    "name": "VPBANK - NH Viet Nam Thinh Vuong",
                    "code": "VPBANK",
                    "image_url": "https://storage.googleapis.com/npay/vpbank-1-1587639645.png",
                    "branch_name": "Đông Đô",
                    "account_no": "232997605",
                    "account_name": "9PAY JSC.",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=BKZ6LBNJ&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "1EPQKP3G",
                    "name": "ACB - NH A Chau",
                    "code": "ACB",
                    "image_url": "https://storage.googleapis.com/npay/acb-1587639548.png",
                    "branch_name": "Đông Đô",
                    "account_no": "258978888",
                    "account_name": "CTY CP 9PAY",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=1EPQKP3G&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                },
                {
                    "id": "B4Z4QP3V",
                    "name": "AGRIBANK - NH Nong Nghiep va PTNT VN",
                    "code": "AGRIBANK",
                    "image_url": "https://storage.googleapis.com/npay/agribank-1-1586749437.png",
                    "branch_name": "Sở Giao Dịch",
                    "account_no": "1200208033357",
                    "account_name": "Cty CP 9Pay",
                    "is_va": false,
                    "qr_code_url": "https://api-console.9pay.vn/bank/show-qr-code?bank_id=B4Z4QP3V&transaction_id=Z4OR7QQZ&user_id=KVPJ4GNE"
                }
            ],
            "bankTransfer": {
                "request_id": "20221010074935POBQ7JW8VEJ863436C1FD2871",
                "partner_id": "6KVPJ4GNEB",
                "trans_id": "Z4OR7QQZ",
                "request_amount": 122150,
                "fee": 0,
                "amount": 122150,
                "content": null,
                "transfer_code": "B15075805028",
                "redirect_url": "https://console.9pay.vn/service/deposit-transfer/Z4OR7QQZ",
                "trans_time": "2022-10-10 07:49:36",
                "signature": "OaySxcjhqaGOu0hl9yM5EHwJeu+2hk3aMptz5ACAlGlQEK2U07dK+A6DXokzCukRTwbmM5kdMo2ZesCLt6rtcFCY6U0504cCRTlaPJ7WYTAh+FTGQGxC7PgUBZ2Eo4BvHIYD34rYZM1UTI6TMv3PzyGAb097rrIBwunFxsOEblcEnXRIsWeOTLEdq5kMGURCq4a/a3pWs5JuHXXO7clfcxGrA+E9qjodpecAufna0oPxYQhIVWietAO8VJunrCJ9J8tZj965eS5nQcF7y74OyiDg+EeZSp2iPt1UkN5WhQQCa/TcYka0r3xpjrP4QSuTpiPz3JWqSWZF5MtvKeFC4Q==",
                "type": "DEPOSIT_TRANSFER_IB",
                "status": "PENDING"
            }
        }
    }
}
```
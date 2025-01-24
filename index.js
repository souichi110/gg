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
//g_car_2714
//https://p.grabtaxi.com/api/passenger/v3/rides/A-7DEAAWAGWG7M?screenName=RestoreRide
//https://p.grabtaxi.com/api/passenger/v3/profile
const KEYS = {
    'g_car_1': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVmcxS3pKV09UbGpSVmRrV0d0eGVqSk9RWEJ5V0VWdE9IWmlWMFl4VjJ3NU9XVm5TbTFLTXpaRll6UjFXR3RIWVRoSFR6SXhURWRWT1dkR1RHWTFRbTAwYlZaWkNuSmFiSE5rV25oaVJrOVpWVkZIUVhSRGFrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVKNVdGTk9OVWRPTVhaelNsYzRZbVo2UzNaYWVqWlJWMG9yZGs1Q2RUSktUelVLUjFSdlNYSldOVWg1ZDBsblZXUkZWMnhGYUdRcllqbE1UVVZFYjA1VWNqaE9aa1ZXVkhkQlNGQkxhRXRRUkdoNGNYZGhWWGczZHowS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6IlBBL1dibVB3akg2YkpPTElwNzhXSnBxK2t3cWlWdStSb2F6N0JMZWh1Y09iZ0ttV2p3PT0iLCJleHAiOjQ4ODg5MDI0MzIsImlhdCI6MTczNTMwMjQyOSwianRpIjoiOTNkYTEyZWUtMWJkNy00OTZjLWFlMmUtN2QwYWEzZmFmMGJmIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiYWYyYzdkM2UtYjJiNS00OGM0LWJkNWYtMmE4MGE1MmJlOWQwIn0.ayAFPPa7yP1mgNNuwuQ-yE2joCpvNAfEZq0J5SlV16YpwYdVUHzxQ8Pgmo-7TnxVb4l0QrpsUhU4zu4fSzQi9Qn23emu5RbbjhrozRuXTvBDF7Nqg98vfNBCBvhvbsbA2MbJ4wrinh0Muec9cjXFraySgvPKOH2Q5p7mxhVBJT6LHOq_fd1OEwOGoXSz9utcoaSEmkJTyFpuUFyBcseSEWqHl_gyv2IKFsTgACinVcOBs7h2scJzPSFxnPw1U6CMXwFj5tIwGtkY-2gmgWU2sYhYMlUaOUI1D46VrficaryHaq1UV03OYrS4XbxKW-HtABs9qawQF0tU01Hs6DS7p0hu_V_eXWXm9_gICb20qUQvZi_4wSxmR2QSeTtqyxCpS9lBGaawIBOchAvlSMOX40H9wKF2eyUryZp7fswTYO35P9Tet4nRCBoWHDNN-HZnbctoz-UrjPIFYPB-Y35a3QSvK3hpgv0OF--XEOXGchFsS7GBk3ykUt-jGiD60YKjPqOl3K0N1v4AxYl4YOtQ96eCy_3K3Pyp23D9lhk289112rHu3pGKpgT1YDHzzCoGoMtIbtX9eeA3MXJ9TF0GTHSVXpE-zbDHVJUks41UvJPvZLJ45I1z8cc_Zp2jF9j2S-WyvX1-8UQzx4d1D87tyQeDbSQhBaCerMfN5SSThZY',
    'g_car_2': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSV2xvZERGWVRrdHhlbU5RVjFSWE0ydFJZbkJXUm1aMGVuaERkMlZhWTNoV1JYRkRVbEV3TVhBMFRubFBabE5SUm1ZeWN6STVaVmN2VFZSWlIyWlZXR0puT1hBMENuZzBaSFJVTld4T09IaFBSRlJ6Y2t0VGVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVKVVYyNUZSM3BFUlRKVE4yMVlRamRJZDI1R2FYRTBlWGh0YlRoNGVraFlNV2NLZEd4cE1HdEZWbmhQWjBsb1FVMW5TU3RzZUdzeEswUnRjMDF5V1ZWRlRIUm5SWGcwT0RoTVdYcEJhR0ZpVmtGc2JXMDFSRmhoZW5rS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImJUY3N0MC9KV2lncTNFanpkVzlsVUcxVE5UaFNRVUlnb3NuNUhVV2FhQmRjaGVnNWl3PT0iLCJleHAiOjQ4OTEyNDY2ODAsImlhdCI6MTczNzY0NjY3NywianRpIjoiNzQ3OTI1MDctOGVmZC00ZmUxLTkxOTgtMDMwYmNlZWJhMmQxIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiNjk3YmRjMDUtMDg4Mi00MGVmLTg2MDUtNzc1NzYzMWU3MjczIn0.bnA7XxwlNkZszXoMcCiVWAYAH8nEC6dhh3vOUzcJ24kpvxzprBV2dy--UNFkArFHf_IAI4Dvl-x3JDJcwnb8c5jzAir_bWXeHRzqYHDcl7UclAXVnPExXg4uKwy_vBDlwXAOWcdAJ9wNQNHY8BFi_6zPt__riwQsC5pQkeqoyyC2ikecan8V3slny2mKsmrCUT8BM-7mDZstEaQJgn_C6KM3fNVKEZdHbVVm65u096xd-BRfRSV8912cR6OeGYeR6lRpxALGwd9sZc2N66H1lexEx0oTLWyIAJ4U3f9KtPFh5kg3FFKJUVVXqs7G9645h_6lcHriZB0fOr6Q37qt_XSHy-3EfpXJoQGTB3vBMpgBNJXW1pcuIkYMj2UrRYM876M3v_Pr9i4fyv5lXhssr5AQGMrtV-16N_ZlVe-oPQUyeRZ7dzJceuX6v2MzoPbKeeH4Jn9VKDCZzPwexjyGbcFRyroVK4JdzRw7Zscwzz_QwjOm8oPA0fbk8Qy58wfsbFGzL7YhJ1BfLKMb91v65Gh155urqmtE8PxZ0xs04XaWlR1U2VtyqARamEIqx47MbzhQoH72Db7bdOjRaqT5CHVQbXCVg3crvJtkkE_Lw5bBAXozqnHNCy45PiLEq3EvyhQ1q0z-aYGePGAoVQvqD5Qjp7DBsoCryT-o2aem7KQ',
    'g_car_3': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVWsyYm14Mk9WQlpNV3B2YTJZdlpWRTFSMFZSZFUxcWQxWjZXWGxDUkN0SGRHWnlLMGRHTVc1dmEwZHJUV1ozYjNkcE5HVm9XalpUU2sxbGNFNHliM0p5VTAwM0NsWlVXbmxyU0doNU4xZFJOVGhsTVZwYVZFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVGRWEzSlllV0pJTldwdE5GQXlNM1ZNY1VsdVZuSlBTM0pEZDFodVREWXdNMUVLU0V0TGNtaG5XbHB6UVVsblRGVmlTMDlRUzNwRE1XdG1aRVJSVEU5WFJUSk5kM1Z0UzAwdmNrTndUV015ZEd4UFpGRTVZVkp0ZHowS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImpIbjRvZ3g5SXJRRDNHTzdMMXdBR1dtam9DUUVzZW92RW43OFcxdU00Y3c2Ujk4Uzl3PT0iLCJleHAiOjQ4ODg4MDYwMTEsImlhdCI6MTczNTIwNjAwOCwianRpIjoiNmNkNDQzYzktNWYxZS00Y2RlLWJjMWQtMzQ2MzVhOTM0NTYxIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiNzIzZTk3MzYtMjgyMS00YTI2LTk3MjctMDM5MTZlNTVmM2VlIn0.DMhV67Rbce3mRVxl3KAH7ui0v5h1UZ3Evz-dmmRrdN-gkKoUv0GeSxULobj-E1nsxLYDabyV3YDFtKn8Y5Is2R3o7EPbrg4Xyu0K-bSAhneOqEtlCjDjx-4w_-etQvrEEeICW-paHi3Y7NuMeo8wCs-tYz00TjU3tukLhuDS_8MG-udjRh9-97qnzn67U64rS7MQIcCBNGs0kZU4yjNbU9_P5YGtOpN36dzIcQ0ntOhgI3cjHVPJcy7pmRRGZCIdvg6xBBYO8KtrBy5YoKmWx_7cabUoat-BkOlGGC4yP1PS7ZAcVhCBvQr3B9cNUMr7YPTsO2gT7hMAE3d49BnHFJjcz8BfBebeccTs0XojND148JRHBXnPUrifvfzdZxgvf9pBJixoLcDAHnLr-yRqAwvqjdZ4v9VjNI67EY75EZdAekyDWdMgIBPNlW08RcQS-yvEH4z6KXgkFxYTHPda9yvFNr9Z7n2tg1vpDS24VgMVlIT00Mqo5yu7-GFfLIdDerdbzBhLTfXTWwGijG-aRCWxCqEnvhuWolHSfttYsYOuUJ23BmcrBDguZdJf3_UH2Kj2FiySBSzR2TAsH8Ad1nJsvTQMsQPmCZwM9_qbOzK0GAzaAQdmj7CnwYMJJY3qZ4SiQqysGQqyCwrl5V0deBhi7fN2ScTGDE9GMdNwzyA',
    'g_car_4': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRFZFTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSWEpMTkRCR1drSk1NbTlZYW5GbWFEWlhjRWRKVTNGYU9WbEJSakJhVUhCc1pUQklaM293WW1sa1JYUnNia05VYUcwMVNuUTNaMGhWYjFadlJFeHJMM1ZtY0ZVNENtNTRRVFpxTXpCaFVHOTVNRWxIV1NzcmFrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NFRkVRa1ZCYVVKUFRFVkViRk16VFcwelYwb3dSbWhNVTBGcVVGQmFkMkp3ZVRWc1duZFBRVWtLZUhSYVFWbHZNUzgzVVVsblRsRTVkbnBaYzI5T2MxTXlkSFpZTm5ORFdYY3hRMDFVUWk5UllWWnZTa3BEWjFSeloxcFZjM2hrUlQwS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6Imc0em42U09lY1EvL2hHQVh2aExTS2tXbDBRV3d3WU12bUE3dTFSV0g2ckU4a1RKVUxRPT0iLCJleHAiOjQ4NzM0OTQ3NDQsImlhdCI6MTcxOTg5NDc0MSwianRpIjoiMjYyMmY4MGUtN2FhYi00NTBhLWI2MGQtOGUxNDFkZDUwYzY3IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiNDRhYzk5NmItNmYzNi00YzY0LTk3ZTEtMzM0NzQ0NGEzZDY5In0.lDCD3CcVDIO7dwp0ZlsdC6ejmLe57xriAUKd4B1OP90Sd74G9wVjGb-lfCIyJ9UX-PpM6Xt63DD45vtQn8HlPqbioJ3rhRQXCgr5w_4tOoAhYpRY0-q0mW0KVXVPKbDOMTdjsK_ZtU3lvVpe7KlfpCRXgsRxs_J6s8mBBluRI5R4Gu4xeKggsoxbbt8ZGiQ8ru1rfRGeZ_5a8FFRKwXXgXD83s3cEMatDbmePcvYiXoF9XS1YKsytnKWBTaNdFTttoDX2CVK1eFuOHGM7lRTeMweoHPsabrt5NLucFH6H60GOKvUtBTmDQFb1GV2jl7w0Ev4ciJSDs4-7kgkl2TENkGnnWA4euwBF-NOf9N9CnfzPNb9VqPsySqyfpcE1xxSE9fe-fun3u8suuDFtIb7qH7ajUj4fbUeJlpAGymtJvuYJ38PzlkHf9Etv23DLR6tVF5CzkcqK6hg0d6ZcJDn2qGlRZQtV1SVB1kEGQCDV9Ith10vpfbywsmvr9-CVUXor3P4-hlcnRcC6GpDsBUSmK6qxK1u-df8hHyAP8rW33dbxUN18t6CGqurkC3feD5fceX6VwdVj4uiJb9-ZNZ2CQmGbUUp7jCUniQcni3xA3jYBBgHCGe93aAPap8FzE3ucb56JUsEjjzAPpvAzkTF06EbtiSIbxPRJQTV1gxtLtg',
    'g_car_5': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGVrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVmhFUW1GMWFESmpkRXBtT0RsTE1WWkxRVkl5UVVsbVVWWlJjMkpXVW1KR1Fsa3ZabTF6YVV0bWQwWXpRamhRUjFFNU9USjJiRGMxWTFGTk9GQkRZVmxuTDJObENra3dNbG94YldjeFFsaEZibE52VEU5SGVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NrRkVRa2RCYVVWQksyMTNUWE5YU0ZGTFJGb3JkMUpEYW1sVGR6bFlVRVphUWxsRE5XMHdabEVLVVd0d1VtczVPVE0yTjNORFNWRkVSMnR3YW5kM1VHeGlaWFJZUml0cGFraHRWRWxRWkRrMU1UTmhTbXBqVTFrMlN6UkdlVTlxYmpsbFVUMDlDaTB0TFMwdFJVNUVJRU5GVWxSSlJrbERRVlJGTFMwdExTMD0iLCJlc2kiOiJVZTlDZEpEYWFXZU5iaGhFVGZpYlJVYjhWYkpFWDEzdTFveExaTW5vTjQwblUvSUpSUT09IiwiZXhwIjo0ODkxMDgzMjA5LCJpYXQiOjE3Mzc0ODMyMDYsImp0aSI6IjExY2U3MjYwLWY5MDAtNGNlMC1iMWI2LWM2OWRkN2Q5OWI3ZSIsImxtZSI6IlBIT05FTlVNQkVSIiwibmFtZSI6IiIsInN1YiI6Ijg2YWVkMzA2LWFmNTYtNGMzMy1iMWRlLTQ1MDA3MjI2MDAwMyJ9.SGP9YT-na1XC686aoWhpv1bJAOtwX34OYPgwS6bZmvSPZARhddBiI8QmhqqjLkdvaMI3ut7FvYnDvIb6dDAKHv9twGVlVwNxvsb_bj7u8B5DD7XzZf2l2f7jYsQA4ce4mIU6hmVmbmCcVfVcN107lEFrWG0Nv6kC3QjM1rGX_0uXtGCITgt0bVqNU5Fzm45agH2oChWjHyjCewsQtgSWvA58Ko6PEeihZ2F-fOqixIr3ylhfI52KPuRuq4Pxs06_LhD3k7BElHMBtvLbDbqrR2uOLXVcHc8i4MLWxf4waOII_nRJzX39llZityNPNRUHzPes0h7vYOTOXuI1olDcpG1-yNKVxuag4UzMk-qJU_CZQ7O7tvKq9xGzBgyE3DEaLd96fG1n4f8rOX3HKSOytxlNTmZWmDUcrdYm_3mcvWojfmy2Jy_r8tUwEkhPRxgL4ege7ggJVtv6ZzmXdv40r8AwhZzFjc1Brx9vVChbGAV2UEv_txctT6fllEhs85C0ljjEE-KFb8aHIjBk6n64gT2OVqDc7G7KcVThkrSIl3o54s5DLlrQKScxbiCHJmtd4suXbbePCZVqCUX5UbHx4QqqrTefAIo-EBuTeyCV4sluG6GqElHhFkscj884LU6kWC4ci66-idKRt8QWEA_6RyF_ZbXocT2gGYMShnA3uww',
    'g_car_6': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVlZwZFhOcFUyTkdibXd2TTNvM2VtUmxTelIwZG1Kbk0wVkJPUzl0YTBONU1rVnhUVUlyU21aMVNFWjNjbFJQVjFCVE5IVTNaWGgyTUVsMlZXTXdTRGhQUzJweUNuaHFhMUJrVm1weU0zTkxObTFGZUdaTmVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVKeGEwVXlRV2xOUlVsbUwzaFFlWFpSY1hCeGNGZENWa3N4V0VwWk1HWnRZVElLY0hZd04yd3hORFp0ZDBsb1FVcFhVbmhuWnpoMFFYUnZhWEJCUkVOdk16ZzJjMDE1TlVwMVowWXpaamhyUWt4Nk5rTnZSRkYyV0ZVS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6IjNoKyszMGo0dzY4c2ZlU3lxNG5Vemw3N0VOVUNBRVVyWldabFptZjlBSkJvVHB1MGFRPT0iLCJleHAiOjQ4OTExNjA1NzgsImlhdCI6MTczNzU2MDU3NSwianRpIjoiYjFlZWQwNDQtZDczZC00YTU2LWE1ZWUtM2U3ZDAyNTg3ZTRjIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiMTZjMzVkMTAtMjYyMS00NjlhLTk1ZjItYmRlZTI0ZGVkNzM0In0.PKz74_XsOAWVOkdCL0g0A2YbcM_nfqT3vTpZhJKNSmSn13fUS9XRWyXErpDt-hJ0iQfb7HSaZZCKWT-x8V7y1o8A9RCoOOCE4Hpqqx8X-TBrJqs1IR_HNafI7ceRD3AhTOkOkCWnB__sikIW92OvpCTSKo321QO6c_i3Xp_VwOlXFPe1pQH911OYPiH4AMYRzd1zzMT8325roIQFvQ7gu7-oCWyH2lmzHm7U9Y343ArfnoErKoq4JyYxGgcGeII_SpnlZixs2Qm_EA7GfijzTZRB7O7BC_j5lstTqRCECcUI2GHR81ExXGXg9znQh6n5U0Y-TJgTEOuM-vO7d0gIkRAs7UQNptpXkfTHrpEhGi_Wnb1G6IDEKamd2L3jovVDXThSWc85ECLDEOZ2IYsYazRTGM7x13o1zH7LoxF_TnCvNUmjJr4v7FOPGydMmyMwcTI3-3NNqBcgV34E-62-g1W7ulHSbnEYb_npthkqPkVFY3u0iDIm0fyWwcB5-yjeHHCt1lGn3nGpDFoZx5Wd2lTkJpH08gT1MRFe--Rr7kv2QWRGHPGUlrllOB_3X3f9dPquLW4GGUYt9J-Zxor03oLa388Nom3ziynlURhV9fTzD-bayvXCb-f1CAARe5pXtqC5xIQMWWx5eoqiFShZlBxbazCKxIc0y9soSe3aWTU',
    'g_car_7': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVTA0Vkdvd1RYTk9TazVoVkRGNFVHTkZXWFpITWl0WGRFTlZSMFl5YkhaM2RuRjRieXRYU0dKUVNVWXhNMGQxTUVaMk1teHVRV2hVU20xeFMzRlNhSE5vUVhoekNtOXRUR1ptTm13MmJESk5iM2hIUWpKR2VrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVFdmVEVnJaVzlIV0ZabkwySktVRlpXY2pocVoxUjFUa3NyZEdKVU1FbHZRMmNLWjBSSlJGQkNaak4yUVVsb1FVeEhZa053WkM5dVlYQlZNbmx3TlV4NFVUbElRV0pVWXpKSWFVdE9jWFpUY0ZZeGVEYzNOVlZNWWxJS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImdaUW90MmV0WFZRYk5BNVRWaVMyM2ZTaVkrMlh1RndiaUhjMmNXeENmcFZCeFJXd1l3PT0iLCJleHAiOjQ4OTAyNzE1NDMsImlhdCI6MTczNjY3MTU0MCwianRpIjoiZDkxOTc2OGYtODIzZS00YzcxLWFjMjctZjFiMGVjNzgwMmIwIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiODk0ODM0OGYtY2Q5Ni00MTI2LWEyODgtYzFhOGY5YmJkYTlmIn0.nqZYx-O-XQp4uv1-PHvC69PCTFKRwUPvgNJGvEouEdrSdKJe6Bl75TSCkUmiJwQPsNYel6WN2zcQg9behciFvDWtrhDgAIVquDB5VhX9zpGUQhoC8SL-cp5SLSSjxmR15F8k0BOKwwPd31eCozk9552PfiNAZSfaR5k-cAd1QEnwsD0xhrW-4GW4ywPdA79v0le7bfrEOr0fbh7iySmEB_3FsGcfTbiMiRpKE-XCZTx5_Z7yMNvDk3Ylczb8zrwRot3IA0xWxBd2uGy7aF5m5EiclXRz5hJ8y1JfS237Uuhi9DieBVVhCse-bJj1zXuz9-5LutvulcI4XO_TXjHRrnbXzucprB4WEdWR2PdcOnHUDSnVYZjs0eYwZP-dik4pjg6jghCpsddgsA8qq8cPhHazXCtnTFBQhpXn2GI2aH4SP63AfcPqznaUsD3sqE2vv_so0AArM6MPYJVzh8MlS2tkOmr5hvod5gL5ilyQuFJPMCjPygheEsLCxSG1MvWoPHBn0SssKQrFcq1NOK-j0bkQLzlqqZARgNOd-bWdwhYwOVpO7TPzXofkugzdReId3FYqvNW1Z_efK8Pw1XALTLaIv3m8IsiM_MzQpYPxWc_FLvJU4vD1YhRG84kQQAA4MCOrdxLuwHCHfDpZjRJ76yE4PXJnSEADNFV3EPME2NA',
    'g_car_8': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGVrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSMXBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVW0xWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVzFMV0RKUGNGZDJPRFo1VDNaV1R6SjRhMjF4UTNad1EwMUdaRVYyZEhGcmNXMXVjVFpLYm1aNVZFcDVXbUZxZUhGWVIwcFNSbkZIZDBOR1dtaHhNa1o0TDB0dUNrMDRXV1JHZDJzcloyZEtkRzl2UWxkMFJFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NrRkVRa2RCYVVWQmNtUk5VMkpzTjJoSWIwOVpla3RaYTNKamFVOVZabFJTZDB0dEsxRjROV29LVmtOVGFrNDVja3B6ZWsxRFNWRkVjRk5sYW1oM1NETXJSMFZ6WTNnMU5EVkVNbmsyTVRKdGJ6ZFpSRFJwYURaWFVGZGFiemt6U2l0NlVUMDlDaTB0TFMwdFJVNUVJRU5GVWxSSlJrbERRVlJGTFMwdExTMD0iLCJlc2kiOiJvUmNrcm44aU5JOWtkRHorRWh3UW9FcXdzUXd1eWl6MCsybnZscUV3L3Q3enVBL1JEZz09IiwiZXhwIjo0ODkxMTYwOTM0LCJpYXQiOjE3Mzc1NjA5MzEsImp0aSI6ImRkMjdkMTFmLTkzMzUtNGJiYy05MGY3LTg5N2Y0MmM1YThhOCIsImxtZSI6IlBIT05FTlVNQkVSIiwibmFtZSI6IiIsInN1YiI6ImY2Y2I4NjBjLWY0ODMtNGVlNS04ZmQxLTEzNDc1NTI1ODI2ZSJ9.EX0pnIpLxQ8_hjG5pKjO6RKN7iDMrRd5sZfqaJebTX9OPuh5YFfartoZBaW5GvU8rsAdK7MtQaEZMB-Zmfj4V4nNlOlXV6hs484S3pe1cwnCdQ94rnzuTgrhOF-jUHWuG_YD5nBNVty8mSNsUkdkj8cDB2AqcjxjluHeSuvBsdvGx339Y1Vc1mhThxFV3xro14p_UvmEHU-9YUyK86eSfjLwWWQlvbWg9XIBBXTcCnzhPyBiIzoEAAm8rgWau0e46Sy_iGP93aRsAX6UbhGGw8R8I-yu0tLoqHq2mEkqGWJUMftZbz5Ml9axedN6FF2dce6dr1MUGHWH9YVSAkIMEeIXQTj1kWzI26Hx7wSdkAEfcEaItN6jGJ1Nc_iJrqa1G_RHDcyCGSk45pK0B7h0CRxx4ZsljwQnlm7md-s8WdcBy8a_3CcnqYyr1GChDwZgCLT_GaPZmkyLKXeS4woEbnoDK4M5ptDs1r4HJnpGBXHXjRCBnw9vXa6S5f20sue0E5KuUn3OkpCfaN1Pt5u7BGpbDXgdQJUPhZj0F4o91LzC6Da2TGLEHeFylEZ6sjMITEVHs6SQJFATgVG39gErgt88HrhI8aq6EdXUteRsZwdAKEYqR2_Zl13gBLS-XJnKpm773TvpBYc2aU48HD7vqzEknuuOpWPOw5HbX2TsAts',
    'g_car_9': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSV05RYVRFMVZtUnNNR1ptVEc5bGNFOXVUMGRzWVZoR1dsaHdlR1ZvV25Cdk1DOVNNSGt2YkZodU5XVTJSbEZHUzFreVdtVTBUMjlETURaV1JIWlZWa1pUVnl0VUNrSkZZak5WYVZkS2RsaGhSVlZSTlc5cWVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVWQk5WVTNUMjlaVkd4U2QzTlRaVUpXWm5CTWVYZENZMEZpVkhCRFJrcFBZMmdLTkdaelRXRjRiMlY2WTBsRFNVVjRSek5UU1RSYVlreEpVMUptUm14dFdWZHhTVzQyUkc1eU9HMVNkMnBQYm5kaFF6SlRTV3c0ZG5NS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6Ik1udU93UXB2Tmp0V3pzTWZHMU5GMHZEdFpORkF0Qml5WXpkMGRpcTlnMnlIQkVNZFFRPT0iLCJleHAiOjQ4OTEyNDc5NjgsImlhdCI6MTczNzY0Nzk2NSwianRpIjoiNWY5ZTYxODEtNWE5Yi00NmJmLWE4NTctZDEzNjkxYzM3OTM0IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiMDYzYmNmNjMtNmU3MC00ZDFjLWE2ZDgtNjRmMWFkNDZmZjk0In0.NkV6-gdaC9tna2DYEOL-g8Y-kA2SNiNoiqLgqPY1HEdTU9stOKYT2tdS9ibz0dpZ5NRqY4Rb-YrkUOVjGEktcUfccvozsQCRjZECV1lTY-vuKFLOpiQ889YRh5-aLDyWZ2DDaaqyS8YsXi1D_ga08BlY0M8DRzg4bLf4ftFdVJJdmC1yu2uhA6FWQSkSToIA2_l0eThNjH9nrAjQzyvFEf7_eKVHWzMlQkISrPffjTGhFaRP2OZtzZQMxWThUtRhbtw3koAFJnM2vcchiwNn0i4-hDhne5qHlK52qbjFJPSxU1cirbQPl3gr6nGH8UPvilEAcUzkWN8HuIJKkGPkxqMmGPnr7UHsFjjaTilna9CiX6ojU5aWj9idUM2qXUPDmbGEuC1qnfmzJ-b-vYlZPG9gVrDwSI6ucPigCDm1TxJNLt5YY59uVRbP5ZbabR0s6SEV-i5noz2eCM5Nnd_n1VfnldE-DWIIx4e7em5cLO0yedSyKGVjq0Xy8Of-9GwzaDe5IDVwG5JiFKxJywvtSgeD3mpVEW6F1VgHO43GryyxOabKQUX3NELRyiMHEq_qOETtvLTYd3Eb6v1CLu9yUAd-8149YgYJVOVmhH7TN6HgWk989PkeFazDV5kU_4ls0RU3Tp8WL2Ifwf9k8za6lRe5U2ZRm8BP4QLgOos0XY0',
    'g_car_10': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGVrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVGRFU0daaVNsUXpka1poWkZKM1pXcGpTWFpHTTBjeFlYTmFVRWhoVm1rNVpIZGpWVnBJU0dOb1RFRlBRbTlOZEUxbE9HVndNM0JRZGxZNFJGZHBTazFuWlVGeUNsRlViSFJDVlVsSFJuWkRWblptU0ZoelJFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NrRkVRa2RCYVVWQmVXOU1WWGRGTTNNd2N6UnlTVUZhWkdWYU5EZHFVbVY0V0RoS1lubGxiMnNLU1hOcFdFNWpWV2xrWkVWRFNWRkRZMjlLTUdsMVNEZGpWV1ZHU0ROQ2MwNUhWR3RxWVhCM1pUSlVSRlUwTTJsRk1uQmpRMVkzWWtGR1p6MDlDaTB0TFMwdFJVNUVJRU5GVWxSSlJrbERRVlJGTFMwdExTMD0iLCJlc2kiOiJtZWtIVG1yelBtY1lvMmkrZGJ1MWtxYmtia1lZdy9ZL0hwbnBObFlPY2N5Q3FLTk96dz09IiwiZXhwIjo0ODkxMjQ4MzY1LCJpYXQiOjE3Mzc2NDgzNjIsImp0aSI6ImUyMDNhMmFjLWQ4MjYtNGQ2MS05NjYzLTg3MGU5MzAyOGI1OSIsImxtZSI6IlBIT05FTlVNQkVSIiwibmFtZSI6IiIsInN1YiI6IjZkMzlkM2MwLWE3ZTEtNDgwNy1hYzhmLWEzNGRiMzc0YzU2YiJ9.aM6LxYN6039A3ku7mO8BczLB_hMS23Yd_klCxnBGAVv3fDEMHebIZrjSMLSMNm7V-gxWCUo3UC9NJG4r2668nzPp-AjCCVG7hTRgmvF2s8MFSwDZfpgOdMhfHM3VOtV6ceBZSUVDiR_M8LOJp1uCNgPqD-Kxs9A8t7xMEB1qIeIZ5zH4hyP4npfO9FwmmuseXPuB_11Zf-hoaBoU4YAHHlOcM3XhmfEpurlResyFLAHuo3P0bvB0EeyVBU7kgmLODExsWCci8GdoUAwg2n9acj_pQnrtGtEF-nFFQ9Azdd7DOWOrE4kQcu5wfhD0IhBA723oBXU3THyiwbErL5aHOBhoimNfIpmiKwDCYwwh5KejlzoSmG5CK7XI6Pl06gOS06XWNxgf0CC2YnbsfA5AIzag0i99hWmsejwTycYekuBtRJ2wUOFESnA0VGZuHi0j_-mocA7SugJ9JgAu7AAQ-mW6nCjpJeqAJu702-UYRDJcz1IJOps2k1cKNcIxq70rWKTWyBmvhr60gj4IbpevTWK2pkVteiB9xI9ZHBLqtc9ftIZcOo3F5bd-YqCIvXK9n0I5gKrfwejWmXh6xu1zgMEzWt_Mv368N-HtrjfPEwb50a-Gn1LyiT0XAOE0APMCHpaa8LrRNk74xFmJPKMMp4CKvl6_cuSZWBlPneGVHhs',
    'g_car_11': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVWhIV1VKcVJ6Wm5OSEZPU0N0b1RYQXhhRmQ2VUVVNFZuVkRkVEY1VUdoaFdUZHdhMHBqU1RCRVJUZ3dTV3RvYWpscWFFRklaM1pxTlRSeFlYSk9iVTVZVldoVkNtNDNjMFZpTDJOQ1JqRnZRMHN2TVcxT1ZFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVGNVZHaEJXa2RYVmtkWlpuRjZPVXhNU2k5RmFUVXpTbVZ2Y1dkNFRESmhkVmdLYVhsV01HSmtOakIzVVVsb1FVOXZhMUp4TTNKTmQySlZiVE12VlVWQlpGaDRTRVZwVkZWUGVIVjFRMHRsTkVwT04zVjFhMWNyUkhnS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6InQ0N01zQ2JZNTZzWktOYWwyNi8wYURUcXpnZURGQlBxK253eWdRMXp0amRIam9JYmJnPT0iLCJleHAiOjQ4OTEyNDkwODMsImlhdCI6MTczNzY0OTA4MCwianRpIjoiNTdkOWQ1MjMtMzNmNC00MzRiLTk1MzktOTYzYmNmYzE3YmZmIiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiZmpmamZqQHlhaG9vLmNvbSIsInN1YiI6IjI5MDQwNWI3LWVjYzQtNDc3Ni05NGJiLWU2OGJlOGE4YTViMSJ9.pvFxgggvC2UV7Egs3eivnC9ABCD6aop7fJ18k2nWkAKKCYOpz8wx-HLwbDzvIkymx5VvVrn_xDEQYgEbpSenD_sdnM--C_SLbMvl76H3p2a-g7Yyf9jzFn-4Ou0YPrAgD9kQCvWeFEiZsWgDhAnrHc1JFcDrsf2d5zaE1t5LF_TR0AhTnbPvvK-d6xVbrfUALX0vXuoEXhEHjvFjIEErFwJhNkphaU9UrAjRcZzZQEOnO0hfNhDGsAbTbPKXKdbKwm26prwba7v119tcvSBaLxL-i_2fmt4MjTL-WTxPDCftr_0iQSIwEu5zslqIJJrtINJhGaR1yQlo_7mzow_zhIl3xU62_JjWOm8ALiCWGbGmI2c2Uy3dw5PmF5qg0_BeVE2-h3clI1p8gUWdEPWZZ0CC1mfIe6etcV9hx2YISZCoL0KobZqPWGD9xEKXUHJv10rWfeBFh_Jywadqrbfr58te48-M0eUfmOJ7YcQpraaAyBsqLXjg1FQPCwWvWpTA6IWLRtQvDy2A7YbhXMTyjES0fXpswmZAMewKUXH-mT264IaWLRuvCMx734AoP0AqOKjwPOavUmd7BUDLrNFwj1k32Udx0BCXmLQe2xwd5ZVAlCskRVYvks0p4OMMcBU8GXNj-Kj9Q0eHxwsoOrslb-7toMDV9M2ps5YAEmMJhUY',
    'g_car_12': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGVrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVFZwZFdwdlpHcFBNM0IzY0VoSWJqSXlObXRIUlhWSWFGQmtMMnN4Y1M5SGVXWkphMVJxVURKNGNqZHBibUp6Vmk5b1ZFOU1ZbkIyT1dzMUwweFlUV1pJTDFsNENuZDZXak5sVHpSQ1QzaEhXVEozUlhrNWVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NrRkVRa2RCYVVWQk5XUTRiRlJsUTB0V2J6VnRjWEZuTm5GMmNpOVhVVVIxWTNka05XdE1VeThLWkRsc1RFMWliRVV6UVhORFNWRkVZME5ZYVdWSlkxbDRNblpwVVcweFZWWTNha1ZQY1hOSVYydzFlRmRsYXpGQmFVVllPVGR2WmxWMlVUMDlDaTB0TFMwdFJVNUVJRU5GVWxSSlJrbERRVlJGTFMwdExTMD0iLCJlc2kiOiJQQUdDU1g3c0c4ck9ZYmNxelVmVlhObjEzMkRGdyt0T2NFUTZBSkErOWQrSjM1T2pRQT09IiwiZXhwIjo0ODkxMjQ5NDIxLCJpYXQiOjE3Mzc2NDk0MTgsImp0aSI6ImU5N2JlZWViLTUzY2EtNDEzYy1iZjFmLTE4NTZkYjk5OTBmMCIsImxtZSI6IlBIT05FTlVNQkVSIiwibmFtZSI6IiIsInN1YiI6IjJkNTc2NTQ4LWYzNzMtNGRkYy1hMWU0LTNmMmZmYjBkZGQzNCJ9.j8X79z1f5aGzoCKXDMTcXcv-TlE6I6rz6ZKWiT-OTrjA5X6Zjc_ry1Sx80o62MiyFEmgeZekI5_AZuRqK4tisDUYbnTBNjTV9AZYXicfooOPSH-N_XzaSqr_LwQauqvEx1c87YW6AJKEeIRzXuAIA3Ka0u16jjfhuPfAe2Sq-vkeuIoBfuvkjkT3czUyO54yizeI5EF4l_vtxafwXOgLfBUxkFfs5xR8RO0X9rLCNo7--pwYvje7hIU2xOIWUn2syziE3Ts75lYC1tc-DHX0TvrkTEpMmigMV2QsO2ozuhd0m9rp1fi6kzgcxsZksNV1DappiKQ3z6Lx14rPF-3Tic7rWe4zMAdWfhFNzxHDIG2ovHqBXhxQcGKNgBR_m41ugPUU7Op5vbAmdXRiBia4bgp0-MRJ4GMI8fON-b57tFr6FJDbxIPLxBdDMFflcNkUn00leep_ie2moJ1kmocg02aQ7muH6-c1PfVt-3SZPqw00TuJjsSvoQUpANb7-h8IAirzLowKzoKWR8y_2w7zeJFFCuJp1jIaI6Cx2add6jV3R1CUGqePJwtR49npv5MsVyUC0H7Gu0mU_o6uqQEalRZNY9NA3xWqAl5lwte0AWWdPUaZS95pj7HjNQhmmE-YBoOan8o5NdSRHuKG-nVOttYOAjKFZPD6jUu2weNB0zQ',
    'g_car_13': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSVUpLVGxSR00xVTFVRlkxVm5KRGVsTndhVWxhYWpORE9XdFVPV05FT0hoVWQyUnNkekYwZG5wRlZFOXhjbTFZVFdVMWFYbEJhbTloUVROdk1rbGpUWGxUYkhKRENqaHZWR015V0VKeGMzRjBNVklyYTJwbVJFRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVWQmRrRjNPRTV5VDJWb2F6aG1VakpHVEdWa2RFUkplVEpKWjBaT1ZtODNPRWdLVVhwRVlYZHFSekJ0T0ZWRFNVTlhkMVpCY2tnclRFdzVRbGsyTlZkeGFuSkhWVXhYVFdkVGVUSkZiME5rWWxjMGRWWnhVM2RsUkdJS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImJoNE0yeTZFbmZxVVJrWUROWjlqcGQ5V0greDNxQks5TGQwbjZMdExjeW9mM1VxL3J3PT0iLCJleHAiOjQ4OTEyNDk2NzAsImlhdCI6MTczNzY0OTY2NywianRpIjoiZTJhMWY1NmQtY2Y0MC00OGYyLWFhMmItOWQ3NDEzODY2MTQ2IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiMWUyZTg0NDktMzFmZC00Yzc0LThhOTQtMWUwZjUxNGU4MTFhIn0.a91-5YPhwuErC3Cdv5zsowRfi0eGOi4x9H-I4hkOAk4vJ41xLUqsTJxUE2493kTRKm7GChhKHe4pvO569noaLTtuxp2D9ioZ5E4M7yL1xceMSEDF4nEoPmvCfl91wJfahw4h-vDMhE6JnVR1pMZ_NA3-JZpBHoiTBh9TOeqmZGt1p6kkSiVw003z7sN83_Q5lYF94JmWp5px82yOvOGzCHmVQNgZeFdLW-yly7ngJA7AOJaYnC2h7BJvRkADojPIcaWT3XAGEkRObrToTP-0M61zcd4u4WrsRVZK8IdioJvu3HredW7tXrD7dq01pd1uy0NQviuj6sGf2ebh5y5xfMhUJc07c-Xr6RSBQsQZaim_ivUYjdaKWmVgw9nvW-gUb7i64w1E9ioaXUtlvKswJOcB2rx0fMFzZHT60k_Rvs8OFeqHHdmwJG9z14bTmu0xci5nIikrkMYs9YalWRCA0FTndZexHUKUWck92mwZe5zw4FMow71_7qGNxXi777zD-jNU-vwD8bGVyd3R9FePPmJgWuurHypzNVQdxqTttG-AeVz5jOPuGoZtcir0-G5jOp45MBUVDvCfqJprXTcM3KQMIIAwy7r0L1nKRIZJ5JWpLcrrzkmTmTwi-mccbT32aelYcLlgKdJ6_yyUjrll3byVjCui8jZuO_4DNhgiCwo',
    'g_car_14': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJQQVNTRU5HRVIiLCJjbmYiOiJMUzB0TFMxQ1JVZEpUaUJEUlZKVVNVWkpRMEZVUlMwdExTMHRDazFKU1VKRGFrTkNjMkZCUkVGblJVTkJaMFZDVFVGdlIwTkRjVWRUVFRRNVFrRk5RMDFCT0hoRVZFRk1RbWRPVmtKQlRWUkNSVnBvWVRKVmQwaG9ZMDVPZWtGM1RWUkJlRTFFUVhjS1RVUkJkMWRvWTA1T1JHZDNUVlJCZUUxRVFYZE5SRUYzVjJwQlVFMVJNSGREZDFsRVZsRlJSRVYzVWtkWlYzUnNUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSQXBCVVdORVVXZEJSWEJJZGpkWE0weHBhMnB1TWtsT1l6YzBPVFpXUkU1MVVERmpUWGx3UzBGaWFFZDZVMDAyU1ZsSmVYWjJhWGxETVhSUFMzbE1aVzV6WVRkVVVVSTRhMlF3TURSMkNrSmxXVkpvZEdoMk5IUjZRVk5LUW1KVWVrRkxRbWRuY1docmFrOVFVVkZFUVdkT1NVRkVRa1pCYVVWQksyWnRZblJWV1doS2IyRkRNbFJMV0RkUVZrOVRRamREUlRrNVkzWlNTRFlLTldsSlFtRTBZbTF2UTBGRFNVVXpjV1JTWVZvdlNtNVlRekZsZW5GbWRsQTVNSFZtVGpGc1pVOHJNMWRNTjJSRlVUbHlWR05QZVRZS0xTMHRMUzFGVGtRZ1EwVlNWRWxHU1VOQlZFVXRMUzB0TFE9PSIsImVzaSI6ImdXd0EzZ1R3OVNtM0JyZkJzdEYxVHlSbSs2ZlN5RWl5WDFjekxsVFJpQW5LWDNrOFJ3PT0iLCJleHAiOjQ4OTEyNTAwODIsImlhdCI6MTczNzY1MDA3OSwianRpIjoiMGE5NTJiZWMtYTQ0ZC00MDFlLTg1NjQtMjMyYTQ4OGU5ZGY2IiwibG1lIjoiUEhPTkVOVU1CRVIiLCJuYW1lIjoiIiwic3ViIjoiOWM3NTFjMjQtNjhhZC00MGFhLTkxODUtYWY4NTEzYWE5OWY1In0.CGxUWu3kzx2EJS3BEUS0kQoTzfW8FySmb0ymmdsgpi2Ub3WqNw53JziLPyAxeMoPNguLbQV5r_vwGYgUS7F7_bThdajwqXIQX3qKEpnSpv9DG5v4NHZg8A_gg85DMhPf6o28lpmashE89gbZYWJGlRLn-Jq02I-j2nYQ_ruUKsJYSnse-DFsZI9EFeoZWqldyXzCdPq6WwFYYUVqe6AsHasWtOxbLMn5fxNyJ2Rf86r_hQ2FAgkQizOyPN-3aYHf6udc4CoF3QPa3H0gOh-eZhCltF4kZchu_nTo92CMySRfH26UyLwZJCfIcLJq_FH4-M2gTbPaKxnFk8Fvht6vFv42wmINftHaXRjRd2qg5iLiCNY6M-ulLiiKYGL7MQoDepqIvMXuUkzZFa-geymJU184CP11-z78QVTcJCY9OkX7-XnOGhIpqeEuNVm3tz6PY67gv1g-QH2ijOHDk2UEcCFtE3yw_j-kPeoiUo83oIwUYpX0xnfmgv-nKNqgryCRWIQNJktPhIKVnzmRNC4iCNxYifFVMXjCBi8Wufldd_5IHOxqtk_iuYjYTVDk-7CiucJgGqV3AgAkN4Un_87uT7_gd6eEz5kxUYpCrlkWkziVOAaaT_F-zlwg05Cf6pdY4weDWT2y8LxubKfJKQx1MMcBqUwdZpxb2xF5yMHQLWI',
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
        const message = `*🚖 Grab Car Allocated!*\n\n*Price:* ${price}\n*Username:* @${genKeys[key]['user']} | ${genKeys[key]['fullname']}\n*🔑 Key:* ${key}\n*🔗 Link:* [Click here](${link})`;
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
    const fullname = req.query.fname;
    if (!keyName) {
        return res.status(400).send({ error: 'Key name is required' });
    }
    const tempKey = `tempkey_${Math.random().toString(36).substring(2)}`;
    const authKeys = Object.keys(KEYS);
    const assignedAuth = KEYS[authKeys[Math.floor(Math.random() * authKeys.length)]];
    genKeys[keyName + '_' + tempKey] = {
        fullname: fullname,
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

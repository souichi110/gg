/*!
 * --------------------------------------------------
 * Script Name: Grab car
 * Author: Ryry
 * Created: 10/11/24
 * GitHub: https://github.com/Souichi1103/Souichi1103
 * Description: A script for Grab Car easy ride functionality.
 * --------------------------------------------------
 */
(function($) {
    const $pickupInput = $('#pickupSearchBar');
    const $dropoffInput = $('#dropoffSearchBar');
    const $resultsContainer = $('#resultsContainer');
    const $confirmButton = $('#confirmButton');
    const $grabCarDetails = $('#grabCarDetails');
    const socket = io();
    let pickupLocation = null;
    let dropoffLocation = null;
    let selectedCarIndex = null;
    const key = params('key');
    
    const fetchResults = async (keyword, type) => {
        if (!keyword) return $resultsContainer.empty();
        try {
            const { result } = await $.getJSON(`/api/search?keyword=${encodeURIComponent(keyword)}&key=${key}`);
            displayResults(result, type);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const displayResults = (locations, type) => {
        $resultsContainer.empty();
        locations.forEach(location => {
            const $locationDiv = $('<div>').addClass('location-result').data('location', location);
            const $locationName = $('<div>').addClass('location-name').text(location.address.name);
            const $locationAddress = $('<div>').addClass('location-address').text(location.address.combined_address);

            $locationDiv.append($locationName, $locationAddress)
                .on('click', () => handleSelection(location, type));
            $resultsContainer.append($locationDiv);
        });
    };

    const handleSelection = (location, type) => {
        const selectedLocation = {
            id: location.id,
            name: location.address.name,
            combined_address: location.address.combined_address,
            latlng: location.latlng
        };
        if (type === 'pickup') {
            pickupLocation = selectedLocation;
            $pickupInput.val(location.address.name);
        } else if (type === 'dropoff') {
            dropoffLocation = selectedLocation;
            $dropoffInput.val(location.address.name);
        }
        $resultsContainer.empty();
    };

    const requestor = (data, requestType) => new Promise((resolve, reject) => {
        console.log(`Sending ${requestType} request with data:`, data);
        data.key = key;
        socket.emit('action', data);

        const handler = (responseData) => {
            console.log(`Received ${requestType} response:`, responseData);
            resolve(responseData);
        };

        socket.once('actionResponse', handler);
        setTimeout(() => reject(new Error(`No response for ${requestType}`)), 5000);
    });

    const varHandler = (() => {
        const variables = {};

        return {
            set: (key, value) => { variables[key] = value; },
            get: (key) => variables[key]
        };
    })();

    (async function init() {
        const url = 'https://p.grabtaxi.com/api/passenger/v4/loyalty/pax-state-info?latitude=14.546134135961552&longitude=121.19037125396864';
        const requestData = { url };
        try {
            const response = await requestor(requestData, 'init');
            const data = JSON.parse(response.response);
            const partnerUID = data.flexibleRewardsConfigs[0].partnerUID;
            console.log(partnerUID);
            varHandler.set('partnerUID', partnerUID);
        } catch (error) {
            console.error('Error fetching or processing data:', error);
        }
    })();

    const displayGrabCarDetails = (data) => {
        const services = data.categoryGroups[0].groups[0].services;
        const grabCarList = $('#grabCarList').empty();
        grabCarList.append(
            services.map((service, index) =>
                `<li class="grab-car-item" data-index="${index}">
                    <div class="grab-car-item-inner">
                        <input type="checkbox" class="checkbox">
                        <img src="${service.display.iconURL || 'path/to/question-mark-icon.png'}" alt="${service.name}" class="service-icon">
                        <div class="grab-car-content">
                            <div class="grab-car-title">${service.name}</div>
                            <div class="grab-car-price">
                                ${(service.quote.currency.symbol).replace('P', '₱')} ${service.quote.lowerBound.toString().slice(0, -2)}.${service.quote.lowerBound.toString().slice(-2)}
                                ${service.quote.lowerBound !== service.quote.upperBound ? ` - ${(service.quote.currency.symbol).replace('P', '₱')}${service.quote.upperBound.toString().slice(0, -2)}.${service.quote.upperBound.toString().slice(-2)}` : ''}
                            </div>
                            <div class="etd">Estimated Time: ${service.etd?.displayText ? service.etd.displayText : service.ett?.displayText} drop off</div>
                        </div>
                        <div class="grab-car-info">
                            <a href="${service.display.infoURL}" target="_blank">
                                <img src="https://pluspng.com/img-png/more-info-png-file-infobox-png-1024.png" alt="More Info" />
                            </a>
                        </div>
                    </div>
                </li>`
            ).join('')
        );
        $grabCarDetails.show();
    };

    const displayPaymentMethods = (data) => {
        const $dropdown = $('#paymentMethodsDropdown');
        const $defaultList = $dropdown.find('.default-list');
        const $paymentList = $dropdown.find('.payment-list').empty();

        const linkedMethods = data.sections.find(section => section.title === 'Linked Methods');
        if (linkedMethods) {
            const linkedItems = linkedMethods.items.filter(item => item.componentType === 'PaymentMethod');

            if (linkedItems.length > 0) {
                const defaultMethod = linkedItems.find(item => item.meta.isSelected);
                if (defaultMethod) {
                    $defaultList.html(`
                        <img src="${defaultMethod.meta.icon}" style="height: 30px;">
                        <div class="selected">${defaultMethod.meta.title}</div>
                    `);
                }
            }

            linkedItems.forEach(item => {
                $paymentList.append(`
                    <div class="c-item" data-payment-id="${item.meta.paymentTypeID}">
                        <img src="${item.meta.icon}" class="card-icon" alt="${item.meta.title}">
                        <div class="text">${item.meta.title}</div>
                    </div>
                `);
            });
        }
    };

    const FO = async (PI) => {
        const partnerUUID = varHandler.get('partnerUID');
        const requestData = {
            url: 'https://p.grabtaxi.com/api/passenger/transport/v1/services',
            data: JSON.stringify({ 
                itineraries: [
                    {
                        id: pickupLocation.id,
                        details: {
                            address: pickupLocation.combined_address,
                            keywords: pickupLocation.name,
                            label: null
                        },
                        coordinates: {
                            latitude: pickupLocation.latlng.latitude,
                            longitude: pickupLocation.latlng.longitude,
                            pointID: null
                        },
                        excludedVehicleTypes: [],
                        tags: []
                    },
                    {
                        id: dropoffLocation.id,
                        details: {
                            address: dropoffLocation.combined_address,
                            keywords: dropoffLocation.name,
                            label: null
                        },
                        coordinates: {
                            latitude: dropoffLocation.latlng.latitude,
                            longitude: dropoffLocation.latlng.longitude,
                            pointID: null
                        },
                        excludedVehicleTypes: ["HELICOPTER", "TRIKE"],
                        tags: []
                    }
                ],
                iconSize: "xxxhdpi",
                isNewHitchEnabled: true,
                timeFormat: "AMPM",
                enterprise: null,
                optOut: false,
                discount: null,
                advanceMeta: null,
                insuranceMeta: null,
                paymentMethodID: !PI ? null : String(PI),
                alternativePaymentMethodIDs: [],
                lastUsedServiceID: null,
                isFreshDataRequired: null,
                grabShareV3Enabled: true,
                verticalInfo: {
                    vertical: "CAR",
                    prefilledTaxiTypeID: null,
                    prefilledTaxiTypeIDs: null,
                    categoryID: "",
                    preferenceIDs: [""]
                },
                experienceStage: "CROSSSELL",
                priorityTaxiTypes: null,
                offersPartnerID: partnerUUID,
                biddingMeta: null,
                itineraryRouteRef: null,
                profile: null
             })
        };

        const carDetailsResponse = await requestor(requestData, 'carDetails');
        varHandler.set('carDetailsResponse', carDetailsResponse);
        displayGrabCarDetails(JSON.parse(carDetailsResponse.response));

        return carDetailsResponse;
    };

    const bookGrabCar = async () => {
        
        const carDetailsResponse = JSON.parse(varHandler.get('carDetailsResponse').response);
        const partnerUUID = varHandler.get('partnerUID');
        if (!carDetailsResponse || selectedCarIndex === null) {
            alert('Please select a service.');
            return;
        }
        const selectedService = carDetailsResponse.categoryGroups[0].groups[0].services[selectedCarIndex];
        hs_icon();
        console.log(selectedService.etd?.signature ? selectedService.etd.signature : selectedService.ett?.signature + ' titeee');
        const rideData = {
            url: 'https://p.grabtaxi.com/api/passenger/v3/rides',
            data: JSON.stringify({ 
                advanceV2: null,
                advanced: null,
                allocationExtended: null,
                discount: null,
                driverKey: null,
                enterprise: null,
                etd: selectedService.etd?.seriesID ? {
                    componentsMeta: null,
                    lowerBoundTS: null,
                    seriesID: selectedService.etd?.seriesID ? selectedService.etd.seriesID : selectedService.quote.seriesID,
                    signature: selectedService.etd?.signature ? selectedService.etd.signature : selectedService.quote.signature,
                    upperBoundTS: null
                } : null,
                expense: {
                    code: "",
                    memo: "",
                    tag: "PERSONAL",
                    userGroupID: 0
                },
                fallbackServices: null,
                inviteID: null,
                isUnallocatedExp: null,
                itinerary: [
                    {
                        cityId: 4,
                        coordinates: {
                            latitude: pickupLocation.latlng.latitude,
                            longitude: pickupLocation.latlng.longitude,
                            pointID: null
                        },
                        countryCode: null,
                        countryId: null,
                        details: {
                            address: pickupLocation.combined_address,
                            keywords: pickupLocation.name,
                            label: null
                        },
                        entranceInfo: null,
                        excludedVehicleTypes: [],
                        id: pickupLocation.id,
                        points: [
                            {
                                coordinates: {
                                    latitude: pickupLocation.latlng.latitude,
                                    longitude: pickupLocation.latlng.longitude,
                                    pointID: null
                                },
                                description: null,
                                point_id: "POINT.29CFSH6Q5IN5K",
                                route_info: null,
                                type: "NP"
                            }
                        ],
                        searchMetadataAPI: "recent|recently_used",
                        searchUUID: null,
                        timeZoneID: "Asia/Manila",
                        type: null
                    },
                    {
                        cityId: 4,
                        coordinates: {
                            latitude: dropoffLocation.latlng.latitude,
                            longitude: dropoffLocation.latlng.longitude,
                            pointID: null
                        },
                        countryCode: null,
                        countryId: null,
                        details: {
                            address: dropoffLocation.combined_address,
                            keywords: dropoffLocation.name,
                            label: null
                        },
                        entranceInfo: null,
                        excludedVehicleTypes: [],
                        id: dropoffLocation.id,
                        points: [
                            {
                                coordinates: {
                                    latitude: dropoffLocation.latlng.latitude,
                                    longitude: dropoffLocation.latlng.longitude,
                                    pointID: null
                                },
                                description: null,
                                point_id: "POINT.2MIITZEIGU8CB",
                                route_info: null,
                                type: "NP"
                            }
                        ],
                        searchMetadataAPI: "recent|recently_used",
                        searchUUID: null,
                        timeZoneID: "Asia/Manila",
                        type: null
                    }
                ],
                itineraryRouteRef: null,
                noteToDriver: null,
                offersPartnerID: partnerUUID,
                partnerReferral: {
                    campaignName: "",
                    sourceId: ""
                },
                paymentMethodID: String(paymentPub),
                paymentSignature: null,
                priorityCritical: false,
                promoApplyManually: false,
                promotionCode: null,
                requestedAt: Date.now(),
                rewardID: 0,
                rideFlags: null,
                sameGenderRequired: false,
                scribeSessionID: "f6b93340-4590-4b66-9aef-e6b23166d858",
                seatsRequested: 0,
                services: [
                    {
                        biddingFare: null,
                        etd: selectedService.etd?.seriesID ? {
                            componentsMeta: null,
                            lowerBoundTS: null,
                            seriesID: selectedService.etd?.seriesID ? selectedService.etd.seriesID : selectedService.quote.seriesID,
                            signature: selectedService.etd?.signature ? selectedService.etd.signature : selectedService.quote.signature,
                            upperBoundTS: null
                        } : null,
                        isDiscountAppliedSuccessfully: null,
                        isPrimary: null,
                        quoteSignature: selectedService.quote.signature,
                        serviceId: selectedService.ID
                    }
                ],
                servicesListID: "1ef65d3f-3df6-6e72-86d7-2d5f40ea9706",
                thirdPartyRiders: null,
                transportLiveActivityEnabled: true
             })
        };
        
        //var rr = JSON.parse('{"itineraries":[{"id":"IT.19V64DUWOZAN8","details":{"address":"1453, Dalandan Street, Barangay 177 Camarin, Caloocan City, Metro Manila, 1400, National Capital Region (NCR), Philippines","keywords":"1453 Dalandan St, Brgy. 177,  Camarin","label":null},"coordinates":{"latitude":14.750924258010741,"longitude":121.05639544745259,"pointID":null},"excludedVehicleTypes":[],"tags":[]},{"id":"IT.3C4TS8LEEAH7R","details":{"address":"RSBS Blvd., Balibago, Santa Rosa City, Laguna, 4026, CALABARZON (Region IV-A), Philippines","keywords":"Enchanted Kingdom Main Entrance","label":null},"coordinates":{"latitude":14.282145054007032,"longitude":121.09700445805652,"pointID":null},"excludedVehicleTypes":["HELICOPTER","TRIKE"],"tags":[]}],"iconSize":"xxxhdpi","isNewHitchEnabled":true,"timeFormat":"AMPM","enterprise":null,"optOut":false,"discount":null,"advanceMeta":null,"insuranceMeta":null,"paymentMethodID":null,"alternativePaymentMethodIDs":["259000326","-1000"],"lastUsedServiceID":null,"isFreshDataRequired":null,"grabShareV3Enabled":true,"verticalInfo":{"vertical":"CAR","prefilledTaxiTypeID":null,"prefilledTaxiTypeIDs":null,"categoryID":"","preferenceIDs":[""]},"experienceStage":"CROSSSELL","priorityTaxiTypes":null,"offersPartnerID":"4229954a2f134060b1c6e89ebf61595f","biddingMeta":null,"itineraryRouteRef":null,"profile":null}');
        try {
            
            const response = await requestor(rideData, 'bookRide');
            
            checkAllocationStatus(JSON.parse(response.response));
        } catch (error) {
            console.error('Error booking the ride:', error);
            alert('Failed to book the ride. Please try again.');
        }
    };

    const showLoadingIndicator = () => {
        $('#loadingIndicator').show();
        $('#statusMessage').text('Allocating...');
        $('#allocationStatus').show();
        $('#successIcon').hide();
        $('#errorIcon').hide();
    };
    const hs_icon = (t = '', s = '') => {
        if(t == 'show') {
            $('#' + s + 'Icon').show();
        } else if(t == 'hide') {
            $('#' + s + 'Icon').hide();
        }
    }
    const hideLoadingIndicator = () => {
        $('#loadingIndicator').hide();
        $('#statusMessage').show(); 
    };
    
    const checkAllocationStatus = (data) => {
        
        const carCode = data.code;
        const allocationData = { url: `https://p.grabtaxi.com/api/passenger/v3/rides/${carCode}/status` };
        
        const checkStatus = () => {
            requestor(allocationData, 'ALLOCATING_STATUS')
                .then(async (response) => {
                    const responseData = JSON.parse(response.response);
                    $('#allocationStatus').show();
                    if (responseData.status === 'ALLOCATED') {
                        hideLoadingIndicator();
                        try {
                            const ss = await requestor({
                                url: `https://api.grab.com/api/v1/safety/sharemyride/passenger?bookingCode=${carCode}`
                            }, 'sharedLink');
                            const sss = JSON.parse(ss.response);
                            hs_icon('show', 'success');
                            socket.emit('allocated', key, `https://api.grab.com/api/v1/safety/sharemyride/passenger?bookingCode=${carCode}`);
                            $('#statusMessage').html(`
                                <div class="success">
                                    <h3>Driver allocated. Your driver is on the way!</h3>
                                    <p>Share my ride:</p>
                                    <a href="${sss.link}" target="_blank">Ride link</a>
                                </div>
                            `);
                            
                        } catch (error) {
                            hs_icon('show', 'error');
                            console.error('Error fetching share ride link:', error);
                            $('#statusMessage').text('Driver allocated, but an error occurred while fetching the ride link.');
                        }
                    } else if (responseData.status === 'ALLOCATING') {
                        $('#statusMessage').text(`Allocating... ${responseData.allocationMsg.desc}`);
                        setTimeout(checkStatus, 5000); // Check again after 5 seconds
                    } else if (responseData.reason) {
                        $('#loadingIndicator').hide();
                        $('#errorIcon').show();
                        if(responseData.reason == 'unallocated') {
                            $('#statusMessage').html(`
                                <div class="alert">
                                    <h3>Can't find driver :(</h3>
                                    <p>Try again.</p>
                                </div>
                            `);
                        } else {
                        
                            const errorMetaData = responseData.metaData.paymentErrorPayload;
                            const paymentMethod = errorMetaData.metaData.paymentMethod;
                            const priceInfo = errorMetaData.metaData.priceInfo;
                            const cta = errorMetaData.cta;
                            const additionalInfo = errorMetaData.additionalInfo;
                        
                            $('#statusMessage').html(`
                                <div class="alert">
                                    <img src="${paymentMethod.icon}" alt="${paymentMethod.shortTitle}">
                                    <h3>${errorMetaData.title}</h3>
                                    <p>${errorMetaData.body}</p>
                                    <p>${priceInfo.text}: ${priceInfo.value}</p>
                                    <p>${additionalInfo.txID}</p>
                                </div>
                            `);
                        }
                    } else {
                        $('#statusMessage').text('An unexpected error occurred. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    if(data?.reason == 'order_submit_error') {
                        var payload = JSON.parse(data.ordersdkPayload);
                        console.log(payload);
                        //hs_icon('show', 'error');
                        $('#statusMessage').text('Payment Error: ' + payload.errResp.reason);
                    }
                    hideLoadingIndicator();
                });
        };
        
        showLoadingIndicator();
        checkStatus();
    };
    
    $('.custom-dropdown').on('click', () => {
        $('.payment-list').toggle('show');
    });

    $('.button-c').on('click', bookGrabCar);

    // Event listener for selecting a payment method from the dropdown
        // Event listener for selecting a payment method from the dropdown
    $('#paymentMethodsDropdown').on('click', '.c-item', function () {
        const paymentId = $(this).data('payment-id');
        const actionUrl = $(this).data('action-url');

        if (paymentId) {
            paymentPub = paymentId;
            const selectedMethod = $(this).find('.text').text();
            $('#paymentMethodsDropdown .default-list').html(`
                <img src="${$(this).find('.card-icon').attr('src')}" style="height: 30px;">
                <div class="selected">${selectedMethod}</div>
            `);
        } else if (actionUrl) {
            window.location.href = actionUrl;
        }
    });
    $pickupInput.on('input', () => fetchResults($pickupInput.val(), 'pickup'));
    $dropoffInput.on('input', () => fetchResults($dropoffInput.val(), 'dropoff'));
    $confirmButton.on('click', async () => {
        if (!pickupLocation || !dropoffLocation) {
            alert('Please select both pickup and dropoff locations.');
            return;
        }

        const paymentData = { 
            url: 'https://p.grabtaxi.com/api/passenger/v1/paysi-fe-api/gaap/user/payments/method/list?partner=transport&taxiTypeID=8&enabledPaymentMethods=CARD&enabledPaymentMethods=CASH&disabledCardTypes=PayLater&isPayerTypeSupported=false&orderCountryCode=PH&userGroupID=0&selectedPaymentID=&userInTransit=false&latitude=14.546134135961552&longitude=121.19037125396864&msgID=e7713a0d074843e2978ad6341db35b69&sdkVersion=39&jbrt=false&isRewardsDisabled=false&userProfileID=&userProfileType=personal' 
        };

        try {
            const paymentMethodsResponse = await requestor(paymentData, 'paymentMethods');
            console.log('Payment methods response:', paymentMethodsResponse);
            const paymentMethods = JSON.parse(paymentMethodsResponse.response);
            await FO(paymentMethods.sections[0].items[0].meta.paymentTypeID);
            displayPaymentMethods(paymentMethods);

            $('.search-bar, #resultsContainer, .button').hide();
        } catch (error) {
            console.error('Error processing request:', error);
        }
    });
    $('#grabCarList').on('click', '.grab-car-item', function (e) {
        if (!$(e.target).is('.checkbox')) {
            const $checkbox = $(this).find('.checkbox');
            if ($checkbox.prop('checked')) {
                $checkbox.prop('checked', false);
                $(this).removeClass('selected');
                selectedCarIndex = null;
            } else {
                $('.grab-car-item.selected').removeClass('selected').find('.checkbox').prop('checked', false);
                $checkbox.prop('checked', true);
                $(this).addClass('selected');
                selectedCarIndex = $(this).data('index');
            }
        }
    });
    const clearSelection = () => {
        pickupLocation = dropoffLocation = null;
        $pickupInput.add($dropoffInput).val('');
        fetchResults($pickupInput.val(), 'pickup');
        fetchResults($dropoffInput.val(), 'dropoff');
    };
    function params(param) {
        const query = window.location.search.substring(1);
        const params = query.split('&');
    
        for (let i = 0; i < params.length; i++) {
            const pair = params[i].split('=');
            if (decodeURIComponent(pair[0]) === param) {
                return decodeURIComponent(pair[1]);
            }
        }
    
        return null; // Return null if the parameter is not found
    }
})(jQuery);

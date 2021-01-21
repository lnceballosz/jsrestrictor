//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Pavel Pohner
// SPDX-License-Identifier: GPL-3.0-or-later
//

/// Implementation of HTTP webRequest shield, file: http_shield_firefox.js
/// Contains Firefox specific functions
/// Event handlers for webRequest API, notifications and messaging


browser.runtime.onMessage.addListener(messageListener);


/// webRequest event listener
/// Listens to onBeforeSendHeaders event, receives detail of HTTP request in requestDetail
/// Catches the request, analyzes it's origin and target URLs and blocks it/permits it based
/// on their IP adresses. Requests coming from public IP ranges targeting the private IPs are
/// blocked by default. Others are permitted by default.
async function beforeSendHeadersListener(requestDetail)
{

	//If either of information is undefined, permit it
	//originUrl happens to be undefined for the first request of the page loading the document itself
	if (requestDetail.originUrl === undefined || requestDetail.url === undefined || requestDetail.originUrl === "null" || requestDetail.url === "null")
	{
		return {cancel:false};
	}
	var sourceUrl = new URL(requestDetail.originUrl);
	var fullSourceDomain = sourceUrl.hostname;
	//Removing www. from hostname, so the hostnames are uniform
	sourceUrl.hostname = wwwRemove(sourceUrl.hostname);
	var targetUrl = new URL(requestDetail.url);
	var fullTargetDomain = targetUrl.hostname;
	//Removing www. from hostname, so the hostnames are uniform
	targetUrl.hostname = wwwRemove(targetUrl.hostname);

	var targetIP;
	var sourceIP;
	var isSourcePrivate = false;
	var isDestinationPrivate = false;
	var destinationResolution = "";
	var sourceResolution = "";

	//Host found among user's trusted hosts, allow it right away
	if (checkWhitelist(sourceUrl.hostname))
	{
		return {cancel:false};
	}

	//Checking type of SOURCE URL
	if (isIPV4(sourceUrl.hostname)) //SOURCE is IPV4 adddr
	{
		//Checking privacy of IPv4
		if (isIPV4Private(sourceUrl.hostname))
		{
			//Source is IPv4 private
			isSourcePrivate = true;
		}
	}
	else if(isIPV6(sourceUrl.hostname)) //SOURCE is IPV6
	{
		//Checking privacy of IPv6
		if (isIPV6Private(sourceUrl.hostname))
		{
			//Source is IPv6 private
			isSourcePrivate = true;
		}
	}
	else //SOURCE is hostname
	{
		//Resoluting DNS query for source domain
		sourceResolution = browser.dns.resolve(fullSourceDomain).then((val) =>
		{
			//Assigning source IPs
			sourceIP = val;
			//More IPs could have been found, for each of them
			for (let ip of sourceIP.addresses)
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					if (isIPV4Private(ip))
					{
						//Source is IPv4 private
						isSourcePrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Source is IPv6 private
						isSourcePrivate = true;
					}
				}
			}
		});
	}

	//Analyzing targetUrl
	//Check IPv4/IPv6 and privacy
	if (isIPV4(targetUrl.hostname))
	{
		if (isIPV4Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;

		}
	}
	else if(isIPV6(targetUrl.hostname))
	{
		if (isIPV6Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;
		}
	}
	else //Target is hostname
	{
		//Resoluting DNS query for destination domain
		destinationResolution = browser.dns.resolve(fullTargetDomain).then((val) =>
		{
			//Assigning source IPs
			targetIP = val;
			//More IPs could have been found, for each of them
			for (let ip of targetIP.addresses)
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					if (isIPV4Private(ip))
					{
						//Destination is IPv4 private
						isDestinationPrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Destination is IPv6 private
						isDestinationPrivate = true;
					}
				}
			}
		});
	}
	//Wait till all DNS resolutions are done, because its neccessary for upcoming actions
	await Promise.all([sourceResolution, destinationResolution]);

	//Blocking direction Public -> Private
	if (!isSourcePrivate && isDestinationPrivate)
	{
		notifyBlockedRequest(sourceUrl.hostname, targetUrl.hostname, requestDetail.type);
		return {cancel:true}
	}
	else //Permitting others
	{
		return {cancel: false};
	}
}

/// Event listener hooked up to webExtensions onMessage event
/// Receives full message in message,
/// sender of the message in sender,
/// function for sending response in sendResponse
/// Does appropriate action based on message
function messageListener(message, sender, sendResponse)
{
	//Message came from popup,js, asking whether is this site whitelisted
	if (message.message === "is current site whitelisted?")
	{
		//Read the current hostname
		var currentHost = message.site;
		//Response with appropriate message
		if (checkWhitelist(currentHost))
		{
			return Promise.resolve("current site is whitelisted");
		}
		else
		{
			return Promise.resolve("current site is not whitelisted");
		}
	}
}

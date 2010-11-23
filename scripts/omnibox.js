/*
 * omnibox.js
 * Miniscurl omnibox script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */


// TODO: i18n

/* usage:
 *      shorten url
 *      expand url
 *      service-id url
 */

services = get_services();

chrome.experimental.omnibox.onInputChanged.addListener(function(text, suggest)
{
    if (text.split(" ")[0] in services) { return; }
    
    suggests = [];
    
    $.each(services, function(id, service)
    {
        if (get_service(id).enabled)
        {
            suggests.push({ content: id + " " + text, description: (service.categories.indexOf("expanding") >= 0 ? "Expand" : "Shorten") + " using " + service.name });
        }
    });
    
    suggest(suggests);
});

chrome.experimental.omnibox.onInputEntered.addListener(function(text)
{
    
});
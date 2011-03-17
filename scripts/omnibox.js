/*
 * omnibox.js
 * Miniscurl omnibox script
 *
 * Copyright (C) 2011 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */


// TODO: i18n

/* usage:
 *      [sh]orten url
 *      [ex]pand url
 *      service-id url
 */

services = get_services();

chrome.experimental.omnibox.onInputChanged.addListener(function(text, suggest)
{
    args = text.split(" ");
    suggests = [];
    
    $.each(services, function(id, service)
    {
        if (get_service(id).enabled && id.substring(0, args[0].length) == args[0].substring(0, id.length))
        {
            suggests.push({ content: id + " " + (args.length > 1 ? args[1] : ""), description: (service.categories.indexOf("expanding") >= 0 ? "Expand" : "Shorten") + " using " + service.name });
        }
    });
    
    suggest(suggests);
});

chrome.experimental.omnibox.onInputEntered.addListener(function(text)
{
    
});
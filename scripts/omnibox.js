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

chrome.omnibox.onInputChanged.addListener(function(text, suggest)
{
    args = text.split(" ");

    if (args.length > 1)
    {
        return;
    }

    suggests_top = [];
    suggests_other = [];

    if ("shorten".substring(0, args[0].length) == args[0])
    {
        suggests_top.push({ content: "shorten ", description: "<match>" + "shorten".substring(0, args[0].length) + "</match>" + "shorten".substring(args[0].length) + " <dim>Shorten with default shortener</dim>" });
    }
    if ("expand".substring(0, args[0].length) == args[0])
    {
        suggests_top.push({ content: "expand ", description: "<match>" + "expand".substring(0, args[0].length) + "</match>" + "expand".substring(args[0].length) + " <dim>Expand with default expander</dim>" });
    }

    $.each(services, function(id, service)
    {
        if (id.substring(0, args[0].length) == args[0].substring(0, id.length))
        {
            (get_service(id).enabled ? suggests_top : suggests_other).push({ content: id + " ", description: "<match>" + id.substring(0, args[0].length) + "</match>" + id.substring(args[0].length) + " <dim>" + (service.categories.indexOf("expanding") >= 0 ? "Expand" : "Shorten") + " using " + service.name + "</dim>" });
        }
    });
    
    suggest(suggests_top.concat(suggests_other));
});

chrome.omnibox.onInputEntered.addListener(function(text)
{
    args = text.split(" ");
    if (args[0] in services || ["sh", "shorten", "ex", "expand"].indexOf(args[0]) >= 0)
    {
        if (args.length > 1)
        {
            url = args[1];
            if (["sh", "shorten"].indexOf(args[0]) >= 0)
            {
                handle_url(url, get_config("shortener"), done_shorten_prompt);
            }
            else if (["ex", "expand"].indexOf(args[0]) >= 0)
            {
                handle_url(url, get_config("expander"), done_expand_prompt);
            }
            else
            {
                handle_url(url, args[0], get_service(args[0]).categories.indexOf("expanding") >= 0 ? done_expand_prompt : done_shorten_prompt);
            }
        }
        else
        {
            alert("Missing URL argument");
        }
    }
    else
    {
        alert("Invalid command or service ID: " + args[0]);
    }
});
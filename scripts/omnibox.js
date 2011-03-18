/*
 * omnibox.js
 * Miniscurl omnibox script
 *
 * Copyright (C) 2011 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
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
        suggests_top.push({ content: "shorten ", description: "<match>" + "shorten".substring(0, args[0].length) + "</match>" + "shorten".substring(args[0].length) + " <dim>" + chrome.i18n.getMessage("omni_default_shorten") + "</dim>" });
        suggests_top.push({ content: "shorten this", description: "<match>" + "shorten".substring(0, args[0].length) + "</match>" + "shorten".substring(args[0].length) + " this <dim>" + chrome.i18n.getMessage("omni_shorten_tab") + "</dim>" });
    }
    if ("expand".substring(0, args[0].length) == args[0])
    {
        suggests_top.push({ content: "expand ", description: "<match>" + "expand".substring(0, args[0].length) + "</match>" + "expand".substring(args[0].length) + " <dim>" + chrome.i18n.getMessage("omni_default_expand") + "</dim>" });
    }

    $.each(services, function(id, service)
    {
        if (id.substring(0, args[0].length) == args[0].substring(0, id.length))
        {
            (get_service(id).enabled ? suggests_top : suggests_other).push({ content: id + " ", description: "<match>" + id.substring(0, args[0].length) + "</match>" + id.substring(args[0].length) + " <dim>" + chrome.i18n.getMessage("omni_specific_" + (service.categories.indexOf("expanding") >= 0 ? "expand" : "shorten"), service.name) + "</dim>" });
        }
    });
    
    suggest(suggests_top.concat(suggests_other));
});

chrome.omnibox.onInputEntered.addListener(function(text)
{
    args = text.split(" ");
    console.log(args)
    url = "";
    if (args[0] in services || ["sh", "shorten", "ex", "expand"].indexOf(args[0]) >= 0)
    {
        if (args.length <= 1 || args[1] == "this" || args[1] == "")
        {
            chrome.tabs.getSelected(null, function(tab)
            {
                url = tab.url;
                console.log(url)
                handle_command(args[0], url);
            });
        }
        else
        {
            url = args[1];
            console.log(url)
            handle_command(args[0], url);
        }
    }
    else
    {
        alert(chrome.i18n.getMessage("omni_invalid_command", args[0]));
    }
});

function handle_command(command, url)
{
    if (["sh", "shorten"].indexOf(command) >= 0)
    {
            handle_url(url, get_config("shortener"), done_shorten_prompt);
    }
    else if (["ex", "expand"].indexOf(command) >= 0)
    {
        handle_url(url, get_config("expander"), done_expand_prompt);
    }
    else
    {
        handle_url(url, command, get_service(command).categories.indexOf("expanding") >= 0 ? done_expand_prompt : done_shorten_prompt);
    }
}
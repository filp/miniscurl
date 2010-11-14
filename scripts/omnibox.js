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

commands =
{
    shorten: "shorten -- Shorten a URL using the default shortener (shortcut: sh)",
    expand: "expand -- Expand a URL using the default expander (shortcut: ex)",
    using: "using -- Shorten or expand a URL using a given service (shortcut: us)",
};

chrome.experimental.omnibox.onInputChanged.addListener(function(text, suggest)
{
    suggests = [];
    text = text.split(" ");
    if (text[0] == "using" || text[0] == "us")
    {
        if (text.length == 1)
        {
            recent = storage_get("recent_services");
            $.each(recent, function(id, service_id)
            {
                service = get_service(service_id);
                suggests.push({ content: text[0] + " " + service_id, description: service_id + " -- use " + service.name + " to " + (service.categories.indexOf("expanding") >= 0 ? "expand" : "shorten") + " a URL", descriptionStyles: [chrome.experimental.omnibox.styleMatch(0), chrome.experimental.omnibox.styleDim(service_id.length)] });
            });
        }
        else
        {
            $.each(services, function(id, service)
            {
                if (id.indexOf(text[1]) >= 0 || service.name.indexOf(text[1]) >= 0)
                {
                    suggests.push({ content: text[0] + " " + id, description: id + " -- use " + service.name + " to " + (service.categories.indexOf("expanding") >= 0 ? "expand" : "shorten") + " a URL", descriptionStyles: [chrome.experimental.omnibox.styleMatch(0), chrome.experimental.omnibox.styleDim(id.length)] });
                }
            });
        }
    }
    else
    {
        $.each(commands, function(command, desc)
        {
            if (text[0].substring(0, command.length) == command.substring(0, text[0].length))
            {
                styles = [];
                if (text[0].length > 0)
                {
                    styles.push(chrome.experimental.omnibox.styleMatch(0));
                }
                styles.push(chrome.experimental.omnibox.styleDim(text[0].length > command.length ? command.length : text[0].length));
                suggests.push({ content: command + " ", description: desc, descriptionStyles: styles });
            }
        });
    }
    suggest(suggests);
});

chrome.experimental.omnibox.onInputEntered.addListener(function(text)
{
    text = text.split(" ");
    if (text[0] == "sh" || text[0] == "shorten")
    {
        handle_url(text[1], get_config("shortener"), function(result)
        {
            prompt(chrome.i18n.getMessage(result.status ? "successful_shorten_prompt" : "failed_shorten_prompt", service.name) + "\n\n" + chrome.i18n.getMessage("original_url") + "\n" + text[1], result.msg);
        });
    }
    else if (text[0] == "ex" || text[0] == "expand")
    {
        handle_url(text[1], get_config("expander"), function(result)
        {
            prompt(chrome.i18n.getMessage(result.status ? "successful_expand_prompt" : "failed_expand_prompt", service.name) + "\n\n" + chrome.i18n.getMessage("original_url") + "\n" + text[1], result.msg);
        });
    }
});
/*
 * background.js
 * Miniscurl background script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

// constants/globals
default_settings =
{
    shortener: "googl",
    expander: "expandurl",
    default_action: "shorten",
    clipboard: false,
    use_default: true,
    quick_mode: false,
};
var services;

// initialize
$(function()
{
    init_settings();
    create_menu();
});

// handle messages
chrome.extension.onRequest.addListener(function(request, sender, respond)
{
    if (request.service)
    {
        handle_url(request.url, request.service, respond);
    }
    else if (request.request == "shorten")
    {
        handle_url(request.url, get_config("shortener"), respond);
    }
    else if (request.request == "expand")
    {
        service = get_config("expander");
        handle_url(request.url, get_config("expander"), respond);
    }
    else if (request.request == "copy")
    {
        to_clipboard(request.data);
    }
});

// shorten/expand a URL
function handle_url(url, service_id, callback)
{
    service = get_service(service_id);
    
    // fix urls
    if (!url.match(/^\w+:\/\/.*/))
    {
        url = "http://" + url;
    }
    
    // call the data function or replace string components
    if (typeof(service.data) == "function")
    {
        data = service.data(url, service.username, service.password, service.apikey);
    }
    else
    {
        data = service.data;
        
        data = data.replace("%URL%", encodeURIComponent(url));
        data = data.replace("%USER%", encodeURIComponent(service.username));
        data = data.replace("%PASS%", encodeURIComponent(service.password));
        data = data.replace("%API%", encodeURIComponent(service.apikey));
    }
    
    // do the request
    if ("custom" in service)
    {
        service.custom(url, service.username, service.password, service.apikey, function(response)
        {
            try
            {
                callback(response);
            }
            catch (err)
            {
                result = { status: false, msg: chrome.i18n.getMessage("internal_error") };
            }
        });
    }
    else
    {
        $.ajax({
            type: service.method,
            url: service.url,
            data: data,
            dataType: service.datatype,
            success: function(data, status, xhr)
            {
                try
                {
                    result = service.done(data, xhr.responseText, url, xhr);
                }
                catch (err)
                {
                    result = { status: false, msg: chrome.i18n.getMessage("internal_error") };
                }
                callback(result);
            },
            error: function(xhr, error)
            {
                if (error == null)
                {
                    error = "error";
                }
                callback({ status: false, msg: chrome.i18n.getMessage("ajax_" + error) });
            },
        });
    }
}

function done_shorten_prompt(result)
{
    if (prompt(chrome.i18n.getMessage(result.status ? "prompt_shorten_successful" : "prompt_shorten_failed", service.name) + "\n\n" + chrome.i18n.getMessage("prompt_original_url") + "\n" + url, result.msg) != null && result.status)
    {
        to_clipboard(result.msg);
    }
}
function done_expand_prompt(result)
{
    if (prompt(chrome.i18n.getMessage(result.status ? "prompt_expand_successful" : "prompt_expand_failed", service.name) + "\n\n" + chrome.i18n.getMessage("prompt_original_url") + "\n" + url, result.msg) != null && result.status)
    {
        chrome.tabs.create({ url: result.msg });
    }
}

function to_clipboard(data)
{
    $("input").attr("value", data).select();
    document.execCommand("Copy");
}

// initialize settings
function init_settings()
{
    if (!storage_get("3.0_initialized"))
    {
        storage_set("config", default_settings);
        service_settings = {};
        $.each(services, function(id, service)
        {
            service_settings[id] = {};
        });
        storage_set("services", service_settings);
        storage_set("custom_services", []);
        
        // load from previous versions
        if ("autoclipboard" in localStorage)
        {
            config_set("clipboard", JSON.parse(localStorage["autoclipboard"]));
        }
        if ("quickmode" in localStorage)
        {
            config_set("quick_mode", JSON.parse(localStorage["quickmode"]));
        }
        if ("usefav" in localStorage)
        {
            config_set("use_default", JSON.parse(localStorage["usefav"]));
        }
        
        fix_services(true);
        
        storage_set("3.0_initialized", true)
    }
    else
    {
        fix_services();
    }
    services = get_services();
}

// adds missing user/pass/apikey attributes etc
function fix_services(first)
{
    $.each(services, function(key, value)
    {
        service = get_service(key);
        if (first)
        {
            if (!("enabled" in service))
            {
                if (key in localStorage)
                {
                    set_service(key, "enabled", JSON.parse(localStorage[key]).enabled);
                }
                else
                {
                    set_service(key, "enabled", service.categories.indexOf("recommended") >= 0);
                }
            }
        }
        // add empty account definitions if missing
        if (service.account[0] > 0 && !("username" in service))
        {
            set_service(key, "username", "");
        }
        if (service.account[1] > 0 && !("password" in service))
        {
            set_service(key, "password", "");
        }
        if (service.account[2] > 0 && !("apikey" in service))
        {
            set_service(key, "apikey", "");
        }
    });
}

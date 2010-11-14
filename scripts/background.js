/*
 * background.js
 * Miniscurl background script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

// constants
default_settings =
{
    shortener: "tinyurl",
    expander: "expandurl",
};
input = $("input");

// initialize
$(function()
{
    init_settings();
    create_menu();
});

// handle messages
chrome.extension.onRequest.addListener(function(request, sender, respond)
{
    if (request.request == "shorten" || request.request == "expand")
    {
        if ("service" in request)
        {
            service = request.service;
        }
        else if (request.request == "expand")
        {
            service = get_config("expander");
        }
        else
        {
            service = get_config("shortener");
        }
        handle_url(request.url, service, respond);
    }
    else if (request.request == "copy")
    {
        input.attr("value", request.data).select();
        document.execCommand("Copy");
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

// initialize settings
function init_settings()
{
    storage_set("config", default_settings);
    service_settings = {};
    $.each(services, function(id, service)
    {
        service_settings[id] = {};
    });
    storage_set("services", service_settings);
    fix_services();
    // TODO: import from 2.x
}

// adds missing user/pass/apikey attributes etc
function fix_services()
{
    $.each(services, function(key, value)
    {
        service = get_service(key);
        
        if (!("enabled" in service))
        {
            set_service(key, "enabled", service.categories.indexOf("recommended") >= 0);
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

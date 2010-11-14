/*
 * services.js
 * The data for all services used by Miniscurl
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

services = 
{
    tinyurl:
    {
        name: "TinyURL",
        site: "http://tinyurl.com",
        categories: ["shortening", "recommended"],
        
        url: "http://tinyurl.com/api-create.php",
        data: "url=%URL%",
    },
    googl:
    {
        name: "Goo.gl",
        site: "http://goo.gl",
        categories: ["shortening", "recommended"],
        
        url: "http://goo.gl/api/shorten",
        data: "url=%URL%",
        method: "POST",
        datatype: "json",
        done: function(data, raw, url, xhr)
        {
            if ("short_url" in data)
            {
                return { status: true, msg: data.short_url };
            }
            else
            {
                return { status: false, msg: data.error_message };
            }
        },
    },
    bitly:
    {
        name: "Bit.ly",
        site: "http://bit.ly",
        register: "http://bit.ly/a/sign_up",
        account: [2, 0, 2],
        categories: ["shortening", "recommended"],
        
        url: "http://api.bit.ly/v3/shorten",
        data: function(url, user, pass, api)
        {
            data =
            {
                login: "miniscurl",
                apiKey: "R_de3a810fff9c90fd458c8e5c72b819d8",
                longUrl: url,
            };
            if (user != "" && api != "")
            {
                data.x_login = user;
                data.x_apiKey = api;
            }
            return data;
        },
        method: "POST",
        datatype: "json",
        done: function(data, raw, url, xhr)
        {
            if (data.status_code > 200)
            {
                return { status: false, msg: data.status_txt };
            }
            else
            {
                return { status: true, msg: data.data.url };
            }
        },
    },
    expandurl:
    {
        name: "ExpandURL",
        site: "http://expandurl.appspot.com",
        categories: ["expanding", "recommended"],
        
        url: "http://expandurl.appspot.com/expand",
        data: "url=%URL%",
        method: "POST",
        datatype: "json",
        done: function(data, raw, url, xhr)
        {
            if (data.redirects > 0)
            {
                return { status: true, msg: data.end_url };
            }
            else
            {
                return { status: false, msg: data.status };
            }
        },
    }
};

// load custom
custom_services = storage_get("custom_services");
if (custom_services)
{
    $.each(custom_services, function(id, data)
    {
        // we have to use eval to be able to load functions. even if it's evil.
        eval("service = " + data.code);
        if (services[data.id])
        {
            alert(chrome.i18n.getMessage("id_taken", [data.id, service.name]));
        }
        else
        {
            services[data.id] = service;
        }
    });
}

default_service = {
    name: "",
    site: "",
    register: null,
    account: [0,0,0],
    categories: ["shortening"],
    
    url: "",
    data: "",
    method: "GET",
    datatype: "text",
    beforesend: function(xhr){},
    done: function(data, raw, url, xhr)
    {
        return { status: data.substring(0,4) == "http", msg: data };
    }
}

// iterate over each service and add missing attributes etc.
$.each(services, function(id, service)
{
    services[id] = $.extend({}, default_service, service);
});
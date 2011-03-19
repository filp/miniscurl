/*
 * services.js
 * The data for all services used by Miniscurl
 *
 * Copyright (C) 2011 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

function get_services()
{
    services = 
    {
        tinyurl:
        {
            name: "TinyURL",
            site: "http://tinyurl.com",
            categories: ["shortening", "recommended"],
            
            url: "http://tinyurl.com/api-create.php",
        },
        tinyarrows:
        {
            name: "TinyArrows",
            site: "http://tinyarro.ws",
            
            url: "http://tinyarro.ws/api-create.php",
            data: "utfpure=1&url=%URL%",
        },
        niggr:
        {
            name: "nig.gr",
            site: "http://nig.gr",
            
            custom: function(url, user, pass, api, callback)
            {
                $.get("http://nig.gr/api/"+url, {}, function(data, textStatus, xhr)
                {
                    callback({ status: data.substring(0,4) == "http", msg: data });
                });
            },
        },
        googl:
        {
            name: "goo.gl",
            site: "http://goo.gl",
            account: [1, 1, 0],
            categories: ["shortening", "recommended"],
            
            custom: function(url, user, pass, api, callback)
            {
                endpoint = "https://www.googleapis.com/urlshortener/v1/url"
                request = {
                    method: "POST",
                    parameters: { key: "AIzaSyAluXX4E8fX_uC-3BYLhH42vKqesIcmXLA" },
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ longUrl: url }),
                };
                if (oauth.hasToken()) // send authorized request
                {
                    oauth.sendSignedRequest(endpoint, function(raw, xhr)
                    {
                        data = JSON.parse(raw);
                        if ("error" in data)
                        {
                            if (data.error.code == 401)
                            {
                                oauth.clearTokens();
                            }
                            callback({ status: false, msg: data.error.message });
                        }
                        else
                        {
                            callback({ status: true, msg: data.id });
                        }
                    }, request);
                }
                else // send anonymous request
                {
                    $.ajax({
                        type: "POST",
                        url: endpoint + "?key=" + request.parameters.key,
                        data: JSON.stringify({ longUrl: url }),
                        contentType: "application/json",
                        success: function(data, textStatus, xhr)
                        {
                            if ("error" in data)
                            {
                                callback({ status: false, msg: data.error.message });
                            }
                            else
                            {
                                callback({ status: true, msg: data.id });
                            }
                        },
                        dataType: "json",
                    });
                }
            },
        },
        bitly:
        {
            name: "bit.ly",
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
        jmp:
        {
            name: "j.mp",
            site: "http://j.mp",
            register: "http://j.mp/a/sign_up",
            account: [2, 0, 2],
            
            url: "http://api.j.mp/v3/shorten",
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
                    return { status: false, msg: chrome.i18n.getMessage("expandurl_" + data.status) };
                }
            },
        },
        dafk:
        {
            name: "go.dafk",
            site: "http://go.dafk.net",
            categories: ["recommended", "shortening"],

            url: "http://go.dafk.net/new.php",
            data: "type=json&url=%URL%",
            datatype: "json",
            done: function (data, raw, url, xhr)
            {
                return { status: !(data.error), msg: data.out };
            },
        },
        isgd:
        {
            name: "is.gd",
            site: "http://is.gd",
            categories: ["shortening", "recommended"],
            
            url: "http://is.gd/api.php",
            data: "longurl=%URL%",
            done: function (data, raw, url, xhr)
            {
                return { status: raw.substring(0,5) != "Error", msg: raw };
            },
        },
        vgd:
        {
            name: "v.gd",
            site: "http://v.gd",
            
            url: "http://v.gd/create.php",
            data: "format=json&url=%URL%",
            datatype: "json",
            done: function (data, raw, url, xhr)
            {
                return { status: "shorturl" in data, msg: "shorturl" in data ? data.shorturl : data.errormessage };
            },
        },
        "0mk":
        {
            name: "0.mk",
            site: "http://0.mk",
            account: [ 1, 0, 1 ],
            register: "http://0.mk/registracija",
            
            url: "http://api.0.mk/v2/skrati",
            data: function(url, user, pass, api)
            {
                ret = { link: url };
                if (user != "" && api != "")
                {
                    ret.korisnik = user;
                    ret.apikey = api;
                }
                return ret;
            },
            datatype: "json",
            done: function (data, raw, url, xhr)
            {
                if (data.status == 1)
                {
                    return { status: true, msg: data.kratok };
                }
                else
                {
                    return { status: false, msg: data.greskaMsg };
                }
                
            },
        },
        "2zeus":
        {
            name: "2ze.us",
            site: "http://2ze.us",
            
            url: "http://2ze.us/generate/",
            datatype: "json",
            done: function (data, raw, url, xhr)
            {
                if (data.errors)
                {
                    return { status: false, msg: data.errors[url] };
                }
                return { status: true, msg: data.urls[url].shortcut };
            },
        },
        "4ly":
        {
            name: "4.ly",
            site: "http://4.ly",
            
            url: "http://4.ly/api/short",
            args: "longurl=%URL%",
            datatype: "json",
            callback: function (data, raw, url, xhr)
            {
                if (data.error.code == 0)
                {
                    return { status: true, msg: data.url };
                }
                else
                {
                    return { status: false, msg: data.error.msg };
                }
                
            },
        },
        armin:
        {
            name: "arm.in",
            site: "http://arm.in",
            register: "http://arm.in/login.php",
            
            url: "http://arm.in/arminize/",
            data: "%URL%",
            datatype: "xml",
            done: function (data, raw, url, xhr)
            {
                if (data.getElementsByTagName("error")[0])
                {
                    return { status: false, msg: data.getElementsByTagName("error")[0].childNodes[0].nodeValue };
                }
                else
                {
                    return { status: true, msg: data.getElementsByTagName("arminized_url")[0].childNodes[0].nodeValue };
                }
            },
        },
        urlie:
        {
            name: "URL.ie",
            site: "http://url.ie",
            
            url: "http://url.ie/site/api/tinyurl/create/",
        },
        btgd:
        {
            name: "bt.gd",
            site: "http://bt.gd",
            
            url: "http://bt.gd/shorten",
        },
        budurl:
        {
            name: "BudURL",
            site: "http://budurl.com",
            account: [ 0, 0, 1 ],
            register: "http://budurl.com/?register",
            
            url: "http://budurl.com/api/v1/budurls/shrink",
            data: function(url, user, pass, api)
            {
                ret = { "long_url": url };
                if (api != "")
                {
                    ret["api_key"] = api;
                }
                return ret;
            },
            datatype: "json",
            done: function (data, raw, url, xhr)
            {
                if (parsed.success == 1)
                {
                    return { status: true, msg: data.budurl };
                }
                else
                {
                    return { status: false, msg: data.error_message };
                }
                
            },
        },
        cligs:
        {
            name: "cli.gs",
            site: "http://cli.gs",
            account: [ 0, 0, 2 ],
            register: "http://cli.gs/user/new",
            categories: ["shortening", "recommended"],
            
            url: "http://cli.gs/api/v1/cligs/create",
            data: function(url, user, pass, api)
            {
                return "url=" + url + (api != "" ? "&key=" + api : "") + "&appid=%3Ca+href%3D%22https%3A%2F%2Fchrome.google.com%2Fextensions%2Fdetail%2Feclilalbnmdonojgjmkekinflhodgoii%22%3EMiniscurl%3C%2Fa%3E";
            },
        },
        chilpit:
        {
            name: "chilp.it",
            site: "http://chilp.it",
            url: "http://chilp.it/api.php",
        },
        cogela:
        {
            name: "coge.la",
            site: "http://coge.la",
            account: [ 2, 2, 0 ],
            register: "http://coge.la/altausuarios.php",
        
            url: "http://coge.la/api.php",
            data: function (url, user, pass, api)
            {
                return "url=" + url + (user != "" && pass != "" ? "&user=" + user + "&password=" + pass : "");
            },
        },
        durl:
        {
            name: "durl.me",
            site: "http://durl.me",
            
            url: "http://durl.me/api/Create.do",
            datatype: "json",
            data: "longurl=%URL%&type=json",
            done: function (data, raw, url, xhr)
            {
                if (data.status == "ok")
                {
                    return { "status" : true, "msg" : data.shortUrl };
                }
                else
                {
                    return { "status" : false, "msg" : "Error" };
                }
            
            },
        },
        ez:
        {
            name: "ez.com",
            site: "http://ez.com",
            account: [ 0, 0, 1 ],
            register: "http://ez.com/?register",
            
            url: "http://ez.com/api/v1/ezlinks/shrink",
            datatype: "json",
            data: function(url, user, pass, api)
            {
                return "long_url=" + url + (api != "" ? "&api_key=" + api : "");
            },
            done: function (data, raw, url, xhr)
            {
                if (parsed.success == 1)
                {
                    return { "status" : true, "msg" : data.ezlink };
                }
                else
                {
                    return { "status" : false, "msg" : data.error_message };
                }
                
            },
        },
        foly:
        {
            name: "fo.ly",
            site: "http://fo.ly",
        
            url: "http://api.fo.ly/shorten",
            datatype: "json",
            data: "longUrl=%URL%",
            done: function (data, raw, url, xhr)
            {
                if (data.statusCode == "OK")
                {
                    for (var a in data.results)
                    {
                        if (a.substring(0,5) == "ERROR")
                        {
                            return { "status" : false, "msg" : a };
                        }
                        else
                        {
                            return { "status" : true, "msg" : data.results[a].shortUrl };
                        }
                    }
                }
                else
                {
                    return { "status" : false, "msg" : data.errorMessage };
                }
                
            },
        },
        idek:
        {
            name: "idek.net",
            site: "http://idek.net",
            register: "http://idek.net//userHome/register",
            
            url: "http://idek.net/shorten/",
            data: "idek-api=true&idek-ref=Miniscurl&idek-url=%URL%",
        },
        ikrme:
        {
            name: "ikr.me",
            url: "http://ikr.me",
            account: [ 0, 2, 0 ],
            
            url: "http://iKr.me/api/",
            data: function(url, user, pass, id)
            {
                return "url=" + url + (pass != "" ? "&pwd=" + pass : "");
            },
            done: function (data, raw, url, xhr)
            {
                return { "status" : raw.substring(6, 10) == "http", "msg" : raw.substring(6, raw.length-2) };
            },
        },
        irpe:
        {
            name: "ir.pe",
            site: "http://ir.pe",
        
            url: "http://ir.pe/",
            data: "url=%URL%&api=1",
        },
        lnkby:
        {
            name: "lnk.by",
            site: "http://lnk.by",
            
            url: "http://lnk.by/Shorten",
            datatype: "json",
            data: "url=%URL%&applicationId=miniscurl&format=json",
            done: function (data, raw, url, xhr)
            {
                return { "status" : data.shortUrl.substring(0,4) == "http", "msg" : data.shortUrl };
            },
        },
        longurl:
        {
            name: "LongURL.org",
            url: "http://longurl.org",
            categories: ["expanding"],
            
            url: "http://api.longurl.org/v2/expand",
            datatype: "json"
            data: "url=%URL%&format=json&user-agent=Miniscurl%2F" + VERSION,
            done: function (data, raw, url, xhr)
            {
                if ("long-url" in data)
                {
                    return { status: true, msg: data["long-url"] };
                }
                else if ("messages" in data)
                {
                    return { status: false, msg: data.messages.message }
                }
            },
        },
        longurlplease:
        {
            name: "Long URL Please",
            site: "http://longurlplease.com",
            categories: ["expanding"],
            
            url: "http://longurlplease.appspot.com/api/v1.1",
            datatype: "json",
            data: "q=%URL%",
            done: function (data, raw, url, xhr)
            {
                return { "status" : data[url] != null, "msg" : data[url] };
            },
        },
        metamark:
        {
            name: "Metamark",
            site: "http://metamark.net",
            categories: ["shortening", "recommended"],

            url: "http://metamark.net/api/rest/simple",
            data: "long_url=%URL%",
        },
        migre:
        {
            name: "migre.me",
            site: "http://migre.me",
            
            url: "http://migre.me/api.xml",
            datatype: "xml",
            done: function (data, raw, url, xhr)
            {
                if (data.getElementsByTagName("error")[0].childNodes[0].nodeValue == 0)
                {
                    return { "status" : true, "msg" : data.getElementsByTagName("migre")[0].childNodes[0].nodeValue };
                }
                else
                {
                    return { "status" : false, "msg" : data.getElementsByTagName("errormessage")[0].childNodes[0].nodeValue };
                }
            },
        },
        miudin:
        {
            name: "miud.in",
            site: "http://miud.in",
            
            url: "http://miud.in/api-create.php",
        },
        nnnf:
        {
            name: "nn.nf",
            site: "http://nn.nf",
            
            method: "POST",
            url: "http://nn.nf/api.php",
        },
        rurl:
        {
            name: "rurl.org",
            site: "http://rurl.org",
            account: [ 0, 0, 1 ],
            
            method: "POST",
            datatype: "xml",
            url: "http://rurl.org/api/",
            data: "url=%URL%&apikey=%API%",
            done: function (data, raw, url, xhr)
            {
                if (data.getElementsByTagName("error")[0])
                {
                    return { "status" : false, "msg" : data.getElementsByTagName("error")[0].childNodes[0].nodeValue };
                }
                else
                {
                    return { "status" : true, "msg" : data.getElementsByTagName("url")[0].childNodes[0].nodeValue };
                }
            },
        },
        s8hk:
        {
            name: "s8.hk",
            site: "http://s8.hk",
            
            url: "http://s8.hk/api/shorten",
            datatype: "json",
            data: "longUrl=%URL%&source=Miniscurl&format=json",
            done: function (data, raw, url, xhr)
            {
                return { "status" : true, "msg" : data.shortUrl };
                
            },
        },
        safli:
        {
            name: "saf.li",
            site: "http://saf.li",
            
            url: " http://saf.li/en/create",
            data: "ws=1&url=%URL%",
        },
        samlain:
        {
            name: "samla.in",
            site: "http://samla.in",
            
            url: "http://samla.in/",
            data: "action=api&url=%URL%",
        },
    };

    // load custom
    custom_services = storage_get("custom_services");
    if (custom_services)
    {
        $.each(custom_services, function(id, data)
        {
            if (data.id in services)
            {
                alert(chrome.i18n.getMessage("id_taken", [data.id, service.name]));
            }
            else
            {
                eval("service = " + data.code);
                services[data.id] = service;
            }
        });
    }

    default_service =
    {
        name: "",
        site: "",
        register: null,
        account: [0,0,0],
        categories: ["shortening"],
        
        url: "",
        data: "url=%URL%",
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
    
    return sort_keys(services);
}

// the tiny icons for sharing the URL on different sites
function get_sharers()
{

    return {
        twitter:
        {
            icon: "img/twitter.png",
            url: "http://twitter.com/?status=%MSG%",
        },
        facebook:
        {
            icon: "img/facebook.png",
            url: "http://www.facebook.com/sharer.php?u=%MSG%"
        },
        reddit:
        {
            icon: "img/reddit.png",
            url: "http://reddit.com/submit?url=%MSG%"
        },
        buzz:
        {
            icon: "img/buzz.png",
            url: "http://www.google.com/buzz/post?url=%MSG%"
        },
        qr:
        {
            icon: "img/qr.png",
            url: "http://chart.apis.google.com/chart?chs=256x256&cht=qr&chld=|0&chl=%MSG%"
        }
    };
}
/*
 * options.js
 * Miniscurl options page script
 *
 * Copyright (C) 2011 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

services = get_services();

$(function()
{
    // add labels etc from i18n
    $("title").text(chrome.i18n.getMessage("options_title"));
    $("h1").text(chrome.i18n.getMessage("options_title"));
    
    $("h2").each(function (id, self)
    {
        $(self).text(chrome.i18n.getMessage("options_tab_" + $(self).attr("name")));
    });
    
    $("label, button").each(function (id, self)
    {
        $(self).text(chrome.i18n.getMessage($(self).attr("name")));
    });
    
    $("label[for=user], label[for=pass], label[for=api]").append('<span class="small"></span>');
    
    $("optgroup").each(function (id, self)
    {
        $(self).attr("label", chrome.i18n.getMessage($(self).attr("name")));
    });
    
    $("div[name=popup] label").each(function (id, self)
    {
        $(self).append("<span>").children().addClass("small").text(chrome.i18n.getMessage($(self).attr("name") + "_small"));
    });
    $("div[name=popup] label span").last().addClass("last");
    
    // add radio buttons
    $("label[name=options_label_use_default]").append('<div><input type="radio" id="default_action_shorten" name="default_action" value="shorten"><label for="default_action_shorten" class="radio">' + chrome.i18n.getMessage("options_shorten") + '</label></div>').append('<div><input type="radio" id="default_action_expand" name="default_action" value="expand"><label for="default_action_expand" class="radio">' + chrome.i18n.getMessage("options_expand") + '</label></div>');
    
    // populate dropdowns, load settings, etc
    load_general_tab();
    load_popup_tab();
    load_credentials_tab();
    
    // set up tabs
    $("h2.tab").click(tab_handler).first().click();
    
    // save button clicked
    $("button#save").click(function()
    {
        switch($(".selected").attr("name"))
        {
            case "general":
                set_config("shortener", $("select#shortener").val());
                set_config("expander", $("select#expander").val());
                $("ul#services input").each(function(id, input)
                {
                    set_service($(input).attr("name"), "enabled", $(input).attr("checked"));
                });
                break;
            case "popup":
                $("div.pane[name=popup] input").each(function(id, input)
                {
                    set_config(input.id, input.checked);
                });
                set_config("default_action", $("input[name=default_action]:checked").val());
                break;
            case "credentials":
                cur_service = $("select#credential_service").val();
                set_service(cur_service, "username", $("input#user").val());
                set_service(cur_service, "password", $("input#pass").val());
                set_service(cur_service, "apikey", $("input#api").val());
                break;
            case "custom":
                break;
        }
        $("button#save").text(chrome.i18n.getMessage("options_button_saved"));
        setTimeout('$("button#save").text(chrome.i18n.getMessage("options_button_save"));', 5000);
    });

    $("button#authorize").click(function()
    {
        chrome.extension.sendRequest({ request: "auth" }, function()
        {
            authed();
        });
    });

    $("button#logout").click(function()
    {
        chrome.extension.sendRequest({ request: "log_out" }, function()
        {
            logout();
        });
    });
});

// a tab is clicked
function tab_handler()
{
    self = $(this);
    if (self.attr("name") == "custom")
    {
        $("div#button").css("width", "255px");
        $("button#delete").show();
    }
    else
    {
        $("div#button").css("width", "125px");
        $("button#delete").hide();
    }
    $("h2.selected").removeClass("selected");
    self.addClass("selected");
    $("div.pane").hide();
    switch (self.attr("name"))
    {
        case "general":
            load_general_tab();
            break;
        case "popup":
            load_popup_tab();
            break;
        case "credentials":
            load_credentials_tab();
            break;
        case "custom":
            break;
    }
    $("div[name=" + self.attr("name") + "]").show();
}

function load_general_tab()
{
    $("select#shortener .all, select#shortener .recommended, select#expander, ul#services").empty();
    
    shorteners = $("select#shortener .all");
    recommended = $("select#shortener .recommended");
    expanders = $("select#expander");
    service_list = $("ul#services");
    $.each(services, function(id, service)
    {
        if (service.categories.indexOf("expanding") >= 0)
        {
            expanders.append("<option></option>").children().last().text(service.name).attr("value", id);
        }
        else
        {
            (service.categories.indexOf("recommended") >= 0 ? recommended : shorteners).append("<option></option>").children().last().text(service.name).attr("value", id);
        }
        service_list.append("<li><label></label></li>").children().last().children().last().text(service.name).attr("for", "list_" + id).prepend('<input type="checkbox">').children().attr("id", "list_" + id).attr("name", id).attr("checked", get_service(id).enabled);
    });
    
    $("select#shortener").val(get_config("shortener"));
    $("select#expander").val(get_config("expander"));
}

function load_popup_tab()
{
    $("div.pane[name=popup] input").each(function(id, input)
    {
        input.checked = get_config(input.id);
    });
    $("div.pane[name=popup] input#default_action_" + get_config("default_action")).attr("checked", true);
}

function load_credentials_tab()
{
    function sum(r)
    {
        var total = 0;
        for (var i = 0; i < r.length; i++)
        {
            total += typeof(r[i]) == "number" ? r[i] : 0;
        }
        return total;
    }
    
    service_list = $("select#credential_service");
    service_list.empty();
    service_list.change(credentials_update);
    $.each(services, function(id, service)
    {
        if (sum(service.account) > 0)
        {
             service_list.append("<option></option>").children().last().text(service.name).attr("value", id);
        }
    });
    credentials_update();
}

function credentials_update()
{
    cur_service_id = $("select#credential_service").val();
    if (cur_service_id == "googl")
    {
        $("div#credential_inputs").hide();
        $("button#authorize").css("display", "inline");
        chrome.extension.sendRequest({ request: "is_authed" }, function(is_authed)
        {
            if (is_authed)
            {
                authed();
            }
        });
        return;
    }
    else
    {
        $("button#authorize").hide();
        $("div#credential_inputs").show();
    }
    cur_service = get_service(cur_service_id);
    if (cur_service.account[0] > 0)
    {
        $("input#user").show().val(cur_service.username).prev().show().children().text(chrome.i18n.getMessage(cur_service.account[0] == 1 ? "options_required" : "options_optional"));
    }
    else
    {
        $("input#user").hide().prev().hide()
    }
    if (cur_service.account[1] > 0)
    {
        $("input#pass").show().val(cur_service.password).prev().show().children().text(chrome.i18n.getMessage(cur_service.account[0] == 1 ? "options_required" : "options_optional"));
    }
    else
    {
        $("input#pass").hide().prev().hide()
    }
    if (cur_service.account[2] > 0)
    {
        $("input#api").show().val(cur_service.apikey).prev().show().children().text(chrome.i18n.getMessage(cur_service.account[0] == 1 ? "options_required" : "options_optional"));
    }
    else
    {
        $("input#api").hide().prev().hide()
    }
}

function authed()
{
    $("button#authorize").css(
    {
        color: "#000000",
        "background-color": "#BAFFBA",
    }).text(chrome.i18n.getMessage("options_button_authorized")).attr("disabled", true);
    $("button#logout").css("display", "inline");
}
    
function logout()
{
    $("button#authorize").css(
    {
        color: "#EAF7E6",
        "background-color": "#4B4B4B",
    }).text(chrome.i18n.getMessage("options_button_authorize")).attr("disabled", false);
    $("button#logout").hide();
}
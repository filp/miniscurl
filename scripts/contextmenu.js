/*
 * contextmenu.js
 * Miniscurl context menu script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

function create_menu()
{
    chrome.contextMenus.removeAll();
    parent = chrome.contextMenus.create({
		title: "Miniscurl",
		contexts: ["all"]
	});
    
    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("menu_shorten_tab"),
		parentId: parent,
		contexts: ["page"],
		onclick: function(data, tab)
		{
            url = data.pageUrl;
            if (url == null) { return; }
            handle_url(url, get_config("shortener"), done_shorten_prompt);
        }
	});
    
    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("menu_shorten_this"),
		parentId: parent,
		contexts: ["link", "selection", "image", "video", "audio"],
		onclick: function(data, tab)
		{
            url = get_url(data);
            if (url == null) { return; }
            handle_url(url, get_config("shortener"), done_shorten_prompt);
        }
	});
    
    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("menu_expand_this"),
		parentId: parent,
		contexts: ["link", "selection"],
		onclick: function(data, tab)
		{
            url = get_url(data);
            if (url == null) { return; }
            handle_url(url, get_config("expander"), done_expand_prompt);
        }
	});
    
    chrome.contextMenus.create({
		parentId: parent,
        type: "separator",
        contexts: ["all"]
    });
    
    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("menu_shorten_any"),
		parentId: parent,
		contexts: ["all"],
		onclick: function(data, tab)
		{
            service = get_config("shortener");
            url = prompt(chrome.i18n.getMessage("prompt_shorten_url", get_service(service).name));
            handle_url(url, service, done_shorten_prompt);
        }
	});
    
    chrome.contextMenus.create({
		title: chrome.i18n.getMessage("menu_expand_any"),
		parentId: parent,
		contexts: ["all"],
		onclick: function(data, tab)
		{
            service = get_config("expander");
            url = prompt(chrome.i18n.getMessage("prompt_expand_url", get_service(service).name));
            handle_url(url, service, done_expand_prompt);
        }
	});
}

function get_url(data)
{
    if ("selectionText" in data)
    {
        return data.selectionText;
    }
    else if ("linkUrl" in data)
    {
        return data.linkUrl;
    }
    else if ("srcUrl" in data)
    {
        return data.srcUrl;
    }
    else
    {
        return null;
    }
}
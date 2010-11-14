/*
 * storage.js
 * Helper methods for Miniscurl
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

// miniscurl version
VERSION = "3.0";

function storage_get(idx)
{
    return JSON.parse(localStorage.getItem(idx));
}

function storage_set(idx, val)
{
    localStorage.setItem(idx, JSON.stringify(val));
}

function get_config(idx)
{
    return storage_get("config")[idx];
}

function set_config(idx, val)
{
    config = storage_get("config");
    config[idx] = val;
    storage_set("config", config);
}

function get_service(idx)
{
    return $.extend({}, services[idx], storage_get("services")[idx]);
}

function set_service(service, idx, val)
{
    data = storage_get("services");
    data[service][idx] = val;
    storage_set("services", data);
}

function sort_keys(obj)
{
    keys = [];
    for(key in obj)
    {
        keys.push(key);
    }
    keys.sort();
    dict = {};
    for (key in keys)
    {
        dict[keys[key]] = obj[keys[key]];
    }
    return dict;
}
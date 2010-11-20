/*
 * options.js
 * Miniscurl options page script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */
 
$(function()
{
    // set up tabs
    $("h2.tab").click(tab_handler).first().click();
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
    $("div[name=" + self.attr("name") + "]").show();
}
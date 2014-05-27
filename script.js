
var damage = 0;
var slots = ["head", "torso", "feet", "hands", "shoulders", "legs", "bracers", "mainHand", "offHand", "waist", "rightFinger", "leftFinger", "neck"];

var parsedSlots = 0;

var setNames;
var setBonuses;
var setCounts;
// if the player has a RORG, we increment the set count by 1 if it's at least at 2
var hasRORG;
// if the player is using 2 weapons, we increment the attack speed bonus by 15%
var weaponCount;

var mainStat;

var fireDmg;
var coldDmg;
var lightDmg;
var physicalDmg;
var poisonDmg;
var holyDmg;
var arcaneDmg;
var eliteDmg;

var baseCritChance;
var baseCritDmg;
var baseAtkSpeed;
var baseMainStat;
var bonusCritDmg;
var bonusCritChance
var bonusAtkSpeed;
var bonusMainStat;

var errorStr;

function extractDmg(attribute)
{
    dmg = attribute.split(' ')[3];
    return parseInt(dmg.substring(0, dmg.length - 1));
}

function extractEliteDmg(attribute)
{
    dmg = attribute.split(' ')[5];
    return parseInt(dmg.substring(0, dmg.length - 1));
}

function updateSetBonuses()
{
    for(var i = 0; i < setNames.length; i++)
    {
        if(hasRORG && setCounts[i] > 1)
        {
            setCounts[i] = setCounts[i] + 1;
        }
        
        // parse the ranks
        for(var j = 0; j < setBonuses[i].length; j++)
        {
            if(setCounts[i] >= setBonuses[i][j].required)
            {
                // we apply the bonus if it's something meaningful
                parseAttributes(setBonuses[i][j].attributesRaw, true);
            }
        }
    }
}

function updateNumbers()
{
    parsedSlots++;
    if(parsedSlots == slots.length)
    {
        if(errorStr != "")
        {
            // we show the error link instead of the damage
            $("<div id='errorDiv' />").appendTo("body").hide().text(errorStr);
            $(".attributes-core.secondary").prepend('<li class="tip"><span class="label"><a href="#" onclick="alert($(\'#errorDiv\').text());return false;">Error</a></span></li>');
        }
        else
        {    
            updateSetBonuses();
        
            if(weaponCount > 1)
            {
                // dual wielding gives a 15% atk speed bonus
                baseAtkSpeed += 0.15;
            }
        
            // include the set bonuses from crit chance, crit dmg, atk speed and main stat
            var baseDmg = damage / ((1 + baseCritChance * baseCritDmg) * (1 + baseAtkSpeed) * (1 + baseMainStat / 100.0));
            var realDmg = baseDmg * (1 + (baseCritChance + bonusCritChance) * (baseCritDmg + bonusCritDmg)) * (1 + baseAtkSpeed+bonusAtkSpeed) * (1 + (baseMainStat + bonusMainStat) / 100.0);
            var roundedRealDmg = Math.round(realDmg);
            
            var elementalMult = 1 + Math.max(fireDmg, coldDmg, lightDmg, physicalDmg, poisonDmg, holyDmg, arcaneDmg);
            var eliteElementalMult = 1 + eliteDmg;
            
            var elementalDmg = realDmg * elementalMult;
            var eliteElementalDmg = realDmg * eliteElementalMult * elementalMult;
            
            
            // elemental tooltip
            var elementalContentCell = $("#tooltip-dps-elemental");
            if(elementalContentCell.length == 0)
            {
                var elementalTooltip = $("<div/>").addClass("ui-tooltip").appendTo("body").hide();
                elementalContentCell = $("<div id='tooltip-dps-elemental'/>").addClass("tooltip-content").appendTo(elementalTooltip);
            }
            elementalContentCell.html('<div xmlns="http://www.w3.org/1999/xhtml" class="profile-tooltip"><p><span class="d3-color-gold">Elemental damage: <span class="d3-color-green"><span class="value">' + elementalDmg.toFixed(2) + '</span></span></span><br /><span class="tooltip-icon-bullet"></span> The amount of skill damage per second you can deal with your highest element.<br /><span class="tooltip-icon-bullet"></span> Damage is based on your weapons, attributes, attack speed, Critical Hit Chance,Critical Hit Damage, elemental damage increase, set bonuses, passive skills, and dual-wielding attack speed increase.</p></div>');
            
            // elemental elite tooltip
            var eliteContentCell = $("#tooltip-dps-elemental-elite");
            if(eliteContentCell.length == 0)
            {
                var eliteTooltip = $("<div/>").addClass("ui-tooltip").appendTo("body").hide();
                eliteContentCell = $("<div id='tooltip-dps-elemental-elite'/>").addClass("tooltip-content").appendTo(eliteTooltip);
            }
            eliteContentCell.html('<div xmlns="http://www.w3.org/1999/xhtml" class="profile-tooltip"><p><span class="d3-color-gold">Elemental elite damage: <span class="d3-color-green"><span class="value">' + eliteElementalDmg.toFixed(2) + '</span></span></span><br /><span class="tooltip-icon-bullet"></span> The amount of skill damage per second you can deal to elites with your highest element.<br /><span class="tooltip-icon-bullet"></span> Damage is based on your weapons, attributes, attack speed, Critical Hit Chance,Critical Hit Damage, elemental damage increase, set bonuses, passive skills, and dual-wielding attack speed increase.</p></div>');
            
            var height = 130;
            
            if(roundedRealDmg != Math.round(damage))
            {
                // real damage tooltip
                var realContentCell = $("#tooltip-dps-real");
                if(realContentCell.length == 0)
                {
                    var realTooltip = $("<div/>").addClass("ui-tooltip").appendTo("body").hide();
                    realContentCell = $("<div id='tooltip-dps-real'/>").addClass("tooltip-content").appendTo(realTooltip);
                }
                realContentCell.html('<div xmlns="http://www.w3.org/1999/xhtml" class="profile-tooltip"><p><span class="d3-color-gold">Actual damage: <span class="d3-color-green"><span class="value">' + realDmg.toFixed(2) + '</span></span></span><br /><span class="tooltip-icon-bullet"></span> The amount damage per second you can deal, including your set bonuses.<br /><span class="tooltip-icon-bullet"></span> Damage is based on your weapons, attributes, attack speed, Critical Hit Chance,Critical Hit Damage, set bonuses, passive skills, and dual-wielding attack speed increase.</p></div>');
            
                height += 26;
            
                $(".attributes-core.secondary").prepend('<li data-tooltip="#tooltip-dps-real" class="tip"><span class="label">Actual damage</span><span class="value">' + roundedRealDmg  + '</span></li>');
            }
            $(".attributes-core.secondary").prepend('<li data-tooltip="#tooltip-dps-elemental-elite" class="tip"><span class="label">Elemental elite damage</span><span class="value">' + Math.round(eliteElementalDmg) + '</span></li>');
            $(".attributes-core.secondary").height(height).prepend('<li data-tooltip="#tooltip-dps-elemental" class="tip"><span class="label">Elemental damage</span><span class="value">' + Math.round(elementalDmg) + '</span></li>');
        }
    }
}

function parseAttributes(attributesRaw, isSetBonus)
{
    if(attributesRaw[ELEMENT_PREFIX + "Fire"] != null)
    {
        fireDmg += attributesRaw[ELEMENT_PREFIX + "Fire"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Cold"] != null)
    {
        coldDmg += attributesRaw[ELEMENT_PREFIX + "Cold"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Lightning"] != null)
    {
        lightDmg += attributesRaw[ELEMENT_PREFIX + "Lightning"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Physical"] != null)
    {
        physicalDmg += attributesRaw[ELEMENT_PREFIX + "Physical"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Poison"] != null)
    {
        poisonDmg += attributesRaw[ELEMENT_PREFIX + "Poison"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Holy"] != null)
    {
        holyDmg += attributesRaw[ELEMENT_PREFIX + "Holy"].min;
    }
    if(attributesRaw[ELEMENT_PREFIX + "Arcane"] != null)
    {
        arcaneDmg += attributesRaw[ELEMENT_PREFIX + "Arcane"].min;
    }
    if(attributesRaw["Damage_Percent_Bonus_Vs_Elites"] != null)
    {
        eliteDmg += attributesRaw["Damage_Percent_Bonus_Vs_Elites"].min;
    }
    if(attributesRaw["Attacks_Per_Second_Percent"] != null)
    {
        if(isSetBonus)
        {
            bonusAtkSpeed += attributesRaw["Attacks_Per_Second_Percent"].min;
        }
        else
        {
            baseAtkSpeed += attributesRaw["Attacks_Per_Second_Percent"].min;
        }
    }
    if(attributesRaw["Crit_Damage_Percent"] != null)
    {
        if(isSetBonus)
        {
            bonusCritDmg += attributesRaw["Crit_Damage_Percent"].min;
        }
        else
        {
            baseCritDmg += attributesRaw["Crit_Damage_Percent"].min;
        }
    }
    if(attributesRaw["Crit_Percent_Bonus_Capped"] != null)
    {
        if(isSetBonus)
        {
            bonusCritChance += attributesRaw["Crit_Percent_Bonus_Capped"].min;
        }
        else
        {
            baseCritChance += attributesRaw["Crit_Percent_Bonus_Capped"].min;
        }
    }
    if(isSetBonus)
    {
        // check for main stat
        if(attributesRaw[mainStat + "_Item"] != null)
        {
            bonusMainStat += attributesRaw[mainStat + "_Item"].min;
        }
        else if(attributesRaw[mainStat] != null)
        {
            bonusMainStat += attributesRaw[mainStat].min;
        }
    }
}

var ELEMENT_PREFIX = "Damage_Dealt_Percent_Bonus#";

function parseSlot(slot)
{
    var slotElt = $("li.slot-" + slot).children(".slot-link");

    if(slotElt.length != 0)
    {
        var path = slotElt.attr("data-d3tooltip");
        
        $.getJSON( window.location.protocol + "//" + window.location.hostname + "/api/d3/data/" + path, function( data ) {
        
            if(data.id == "Unique_Ring_107_x1")
            {
                hasRORG = true;
            }
            
            if(data.dps != null)
            {
                // this is a weapon
                weaponCount++;
            }
        
            parseAttributes(data.attributesRaw, false);
            
            // gems
            if(data.gems.length > 0)
            {
                for(var i = 0; i < data.gems.length; i++)
                {
                    parseAttributes(data.gems[i].attributesRaw, false);
                }
            }
            
            // set bonuses
            if(data.set != null)
            {
                // we keep the set in a list with an increment
                var index = setNames.indexOf(data.set.slug);
                if(index != -1)
                {
                    setCounts[index] = setCounts[index] + 1;
                }
                else
                {
                    setNames.push(data.set.slug);
                    setBonuses.push(data.set.ranks);
                    setCounts.push(1);
                }
            }
    
            updateNumbers();
        }).fail(function(jqxhr, textStatus, error) {
        
            errorStr += "Error: " + textStatus + ", " + error + " (" + window.location.protocol + "//" + window.location.hostname + "/api/d3/data/wawa" + path + "). ";
            
            updateNumbers();
        });
    }
    else
    {
        updateNumbers();
    }
}

function parseSlots()
{
    setNames = [];
    setCounts = [];
    setBonuses = [];
    hasRORG = false;
    weaponCount = 0;
    parsedSlots = 0;
    fireDmg = 0.0;
    coldDmg = 0.0;
    lightDmg = 0.0;
    physicalDmg = 0.0;
    poisonDmg = 0.0;
    holyDmg = 0.0;
    arcaneDmg = 0.0;
    
    eliteDmg = 0.0;
    
    baseCritChance = 0.05;
    baseCritDmg = 0.5;
    baseAtkSpeed = 0.0;
    
    // set items stuff
    bonusCritDmg = 0.0;
    bonusCritChance = 0.0;
    bonusAtkSpeed = 0.0;
    bonusMainStat = 0.0;
    
    damage = $(".attributes-core.secondary").children("li:first").children("span:last").text();
    
    errorStr = "";
    
    var nameArray = $("#heroes").parent().attr("class").split("-");
    var characterClass = nameArray.slice(0, nameArray.length - 1).join("-").replace(/(\r\n|\n|\r)/gm,"").trim();
    switch(characterClass)
    {
        case "monk":
        case "demon-hunter":
            mainStat = "Dexterity";
            break;
        case "witch-doctor":
        case "wizard":
            mainStat = "Intelligence";
            break;
        case "barbarian":
        case "crusader":
            mainStat = "Strength";
            break;
    }
    
    baseMainStat = parseInt($("li[data-tooltip=#tooltip-" + mainStat.toLowerCase() + "-hero]").find(".value").text());
    
    for(var i = 0; i < slots.length; i++)
    {
        parseSlot(slots[i]);
    }
}

parseSlots();


// override of the html jQuery function to know when a profile is loaded
var s = document.createElement('script');
s.innerHTML = "$.fn.htmlOriginal = $.fn.html; $.fn.html = function (html) { if(html == null){var result = this.htmlOriginal();}else{var result = this.htmlOriginal(html);}if(html != null){try{var jHtml = $(html);if(jHtml.find('a.hero-tab').length > 0){document.dispatchEvent(new CustomEvent('loadProfileCallback'));}}catch(err) { }}return result;}";
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

// event listener
document.addEventListener('loadProfileCallback', function(e) {
    parseSlots();
});

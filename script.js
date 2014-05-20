// adapt ui height and stuff

var damage = $(".attributes-core.secondary").children("li:first").children("span:last").text();
var slots = ["head", "torso", "feet", "hands", "shoulders", "legs", "bracers", "mainHand", "offHand", "waist", "rightFinger", "leftFinger", "neck"];

var fireDmg = 0;
var iceDmg = 0;
var lightDmg = 0;
var physicalDmg = 0;
var poisonDmg = 0;
var holyDmg = 0;
var arcaneDmg = 0;

function extractDmg(attribute)
{
    dmg = attribute.split(' ')[3];
    return parseInt(dmg.substring(0, dmg.length - 1));
}

var parsedSlots = 0;
function updateNumbers()
{
    parsedSlots++;
    if(parsedSlots == slots.length)
    {
        var elementalMult = 1 + Math.max(fireDmg, iceDmg, lightDmg, physicalDmg, poisonDmg, holyDmg, arcaneDmg) / 100.0;

        $(".attributes-core.secondary").height(104).prepend('<li class="tip"><span class="label">Elemental Damage</span><span class="value">' + Math.round(damage * elementalMult)  + '</span></li>');
    }
}

function parseSlot(slot)
{
    var slotElt = $("li.slot-" + slot).children(".slot-link");

    if(slotElt.length != 0)
    {
        var path = slotElt.attr("data-d3tooltip");

        $.getJSON( "http://us.battle.net/api/d3/data/" + path, function( data ) {
            for(var i = 0; i < data.attributes.primary.length; i++)
            {
                if(data.attributes.primary[i].text.indexOf("Fire skills deal ") != -1)
                {
                    fireDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Cold skills deal ") != -1)
                {
                    coldDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Lightning skills deal ") != -1)
                {
                    lightDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Physical skills deal ") != -1)
                {
                    physicalDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Poison skills deal ") != -1)
                {
                    poisonDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Holy skills deal ") != -1)
                {
                    holyDmg += extractDmg(data.attributes.primary[i].text);
                }
                if(data.attributes.primary[i].text.indexOf("Arcane skills deal ") != -1)
                {
                    arcaneDmg += extractDmg(data.attributes.primary[i].text);
                }
            }
    
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
    parsedSlots = 0;
    fireDmg = 0;
    iceDmg = 0;
    lightDmg = 0;
    physicalDmg = 0;
    poisonDmg = 0;
    holyDmg = 0;
    arcaneDmg = 0;

    for(var i = 0; i < slots.length; i++)
    {
        parseSlot(slots[i]);
    }
}

parseSlots();


// override of the html jQuery function to know when a profile is loaded
var s = document.createElement('script');
s.src = chrome.extension.getURL('override.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

// event listener
document.addEventListener('loadProfileCallback', function(e) {
    parseSlots();
});

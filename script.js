// TODO: ADD SET BONUSES TO THE DPS!!

var damage = 0;
var slots = ["head", "torso", "feet", "hands", "shoulders", "legs", "bracers", "mainHand", "offHand", "waist", "rightFinger", "leftFinger", "neck"];

var parsedSlots = 0;

var setNames;
var setBonuses;
var setCounts;
// if the player has a RROG, we increment the set count by 1 if it's at least at 2
var hasRROG
var fireDmg;
var coldDmg;
var lightDmg;
var physicalDmg;
var poisonDmg;
var holyDmg;
var arcaneDmg;
var eliteDmg;

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
	    if(hasRROG && setCounts[i] > 1)
		{
		    setCounts[i] = setCounts[i] + 1;
		}
		
		// parse the ranks
		for(var j = 0; j < setBonuses[i].length; j++)
		{
		    if(setCounts[i] >= setBonuses[i][j].required)
			{
			    // we apply the bonus if it's something meaningful
			    parseAttributes(setBonuses[i][j].attributesRaw);
			}
		}
	}
}

function updateNumbers()
{
    parsedSlots++;
    if(parsedSlots == slots.length)
    {
	    updateSetBonuses();
	
        var elementalMult = 1 + Math.max(fireDmg, coldDmg, lightDmg, physicalDmg, poisonDmg, holyDmg, arcaneDmg);

        var eliteElementalMult = 1 + eliteDmg;

        $(".attributes-core.secondary").prepend('<li class="tip"><span class="label">Elemental Elite Damage</span><span class="value">' + Math.round(damage * eliteElementalMult * elementalMult)  + '</span></li>');
        $(".attributes-core.secondary").height(130).prepend('<li class="tip"><span class="label">Elemental Damage</span><span class="value">' + Math.round(damage * elementalMult)  + '</span></li>');
    }
}

function parseAttributes(attributesRaw)
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
}

var ELEMENT_PREFIX = "Damage_Dealt_Percent_Bonus#";

function parseSlot(slot)
{
    var slotElt = $("li.slot-" + slot).children(".slot-link");

    if(slotElt.length != 0)
    {
        var path = slotElt.attr("data-d3tooltip");

        $.getJSON( "http://us.battle.net/api/d3/data/" + path, function( data ) {
		
		    if(data.id == "Unique_Ring_107_x1")
			{
			    hasRROG = true;
			}
		
		    parseAttributes(data.attributesRaw);
			
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
	hasRROG = false;
    parsedSlots = 0;
    fireDmg = 0.0;
    coldDmg = 0.0;
    lightDmg = 0.0;
    physicalDmg = 0.0;
    poisonDmg = 0.0;
    holyDmg = 0.0;
    arcaneDmg = 0.0;
	
    eliteDmg = 0.0;

    damage = $(".attributes-core.secondary").children("li:first").children("span:last").text();

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

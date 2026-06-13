#!/usr/bin/env python3
"""
Parse CSEZ YouTube VTT transcripts into structured quest data.
Usage: python3 parse_csez_transcripts.py [transcript_directory]
Output: JSON files in /tmp/csez_quest_data/
"""

import json
import glob
import os
import re
import sys
from collections import defaultdict

TRANSCRIPT_DIR = sys.argv[1] if len(sys.argv) > 1 else "/home/donzzz/Downloads/transcripts"
OUTPUT_DIR = "/tmp/csez_quest_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Known map names in CSEZ
KNOWN_MAPS = [
    "suburbs", "dam", "resort", "clifton", "river valley", "dock",
    "cargo zone", "wyeth farm", "west tower", "sewage", "bridge",
    "pylon", "hideout"
]

# Known trader names
KNOWN_TRADERS = ["tommy", "ark", "maggie", "igor", "maximillian", "anna", "johnny", "maximilian"]

# Item/objective keywords
ITEM_KEYWORDS = [
    "wine", "med", "medical", "ammo", "armor", "backpack", "key",
    "disk", "disc", "camera", "gunpowder", "shades", "supply",
    "ration", "food", "water", "battery", "radio", "map",
    "intelligence", "intel", "report", "journal", "sausage",
    "crate", "box", "safe", "pylon", "antenna", "tower",
    "baseball", "disguise", "ingot", "money"
]

# Quest name aliases (transcript speech-to-text → wiki names)
QUEST_ALIASES = {
    "taste of life": "Taste of Life", "taste of life 3": "Taste of Life 3",
    "signal supplies": "Signal Supplies", "coastal antenna": "Coastal Antenna",
    "west tower": "West Tower Secret Room", "info for aid": "Info for Aid",
    "a farewell gift": "A Farewell Gift", "virtual realities": "Virtual Realities",
    "veteran's courts": "The Veteran's Courts", "hidden in plain sight": "Hidden in Plain Sight",
    "treasure in the sewage": "Treasure in the Sewage", "expansion protocol": "Expansion Protocol",
    "toxicology recovery": "Toxicology Recovery", "suburban emergency med": "Suburban Emergency Med Network",
    "river valley pylon": "River Valley Pylon Security", "hack to play": "Hack to Play",
    "ntg medical": "NTG Medical Reports", "clifton recon": "Clifton Recon",
    "lost and found": "Lost and Found", "cold hard cash": "Cold Hard Cash",
    "new bridge": "New Bridge Maintenance", "dam first aid": "Dam First Aid Point",
    "disguised baseball": "Disguised Baseball", "hide discs": "Hide Discs",
    "retrieve ark": "Retrieve ARK Disks", "pre-war recon": "Pre-war Recon",
    "transport clues": "Transport Clues", "wyeth farm": "Wyeth Farm",
    "dock intel": "Dock Intel", "clifton hidden room": "Clifton Hidden Room Radio",
    "meg's camera": "Meg's Camera", "my convoy": "My Convoy",
    "lost medical journal": "The Lost Medical Journal", "sausage trap": "The Sausage Trap",
    "get back my shades": "Get Back My Shades", "dam aircraft": "Dam Aircraft Recon",
    "supply shortage": "Supply Shortage", "referral gift": "Referral Gift",
    "recover my gunpowder": "Recover My Gunpowder", "new friends": "New Friends",
}

# Map synonyms
MAP_SYNONYMS = {
    "suburb": "Suburb", "suburbs": "Suburb", "dam": "Dam", "resort": "Resort",
    "clifton": "Clifton", "river valley": "River Valley", "dock": "Dock",
    "cargo zone": "Cargo Zone", "wyeth farm": "Wyeth Farm", "sewage": "Sewage",
    "bridge": "Bridge", "pylon": "Pylon", "west tower": "West Tower",
    "hideout": "Hideout",
}

# Step keywords for walkthrough extraction
STEP_KEYWORDS = [
    "first", "second", "third", "fourth", "fifth", "step", "next",
    "then", "after that", "finally", "go to", "head to", "make your way",
    "navigate", "find", "collect", "pick up", "grab", "retrieve",
    "turn in", "deliver", "hand in", "submit", "eliminate", "kill",
    "defeat", "mark", "place", "use", "activate", "extract", "leave",
    "look for", "search", "check", "open", "you need to", "you have to",
    "objective", "your goal", "tip", "note", "important", "warning",
    "spawn", "located", "found at", "floor", "room", "building",
]


def parse_vtt(filepath):
    """Parse a VTT file and return list of cleaned text segments."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    segments = []
    current = []

    for line in lines:
        line = line.strip()
        if not line or line.startswith('WEBVTT') or line.startswith('Kind:') or line.startswith('Language:'):
            continue
        if re.match(r'^\d{2}:\d{2}:\d{2}\.\d{3}', line):
            if current:
                segments.append(' '.join(current))
                current = []
            continue
        if line.startswith('align:') or line.startswith('position:'):
            continue
        clean = re.sub(r'<[^>]+>', '', line)
        clean = clean.strip()
        if clean:
            current.append(clean)

    if current:
        segments.append(' '.join(current))
    return segments


def clean_segment(text):
    """Clean a transcript segment for wiki use."""
    text = re.sub(r'\[music\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[sound.*?\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_quest_data(segments, title):
    """Extract quest-relevant data from transcript segments."""
    full_text = ' '.join(segments).lower()
    title_lower = title.lower()

    result = {
        "title": title,
        "quests": [],
        "maps": [],
        "trader": None,
        "items": [],
        "steps": [],
    }

    # Detect quest from title
    for alias, wiki_name in QUEST_ALIASES.items():
        if alias in title_lower:
            result["quests"].append(wiki_name)
            break

    # Detect trader from title or content
    for trader in KNOWN_TRADERS:
        if trader in title_lower or trader in full_text[:500]:
            result["trader"] = trader
            break

    # Detect maps
    for map_key, map_name in MAP_SYNONYMS.items():
        if map_key in full_text and map_name not in result["maps"]:
            result["maps"].append(map_name)

    # Detect items
    for item in ITEM_KEYWORDS:
        if re.search(r'\b' + re.escape(item) + r's?\b', full_text):
            if item not in result["items"]:
                result["items"].append(item)

    # Extract walkthrough steps
    seen_steps = set()
    for segment in segments:
        cleaned = clean_segment(segment)
        if len(cleaned) < 15 or len(cleaned) > 250:
            continue
        if any(kw in cleaned.lower() for kw in STEP_KEYWORDS):
            # Dedup
            normalized = cleaned.lower().strip()
            if normalized not in seen_steps:
                seen_steps.add(normalized)
                result["steps"].append(cleaned)

    return result


def main():
    print(f"CSEZ Transcript Parser")
    print(f"Reading from: {TRANSCRIPT_DIR}")

    vtt_files = sorted(glob.glob(os.path.join(TRANSCRIPT_DIR, "*.vtt")))
    print(f"Found {len(vtt_files)} VTT files\n")

    all_data = []
    total_steps = 0

    for f in vtt_files:
        basename = os.path.basename(f)
        title = basename.replace('.en.vtt', '').replace('.ru.vtt', '')
        title = re.sub(r'\[.*?\]', '', title).strip()
        title = title.replace('ExfilZone Task Guide： ', '').replace('RadFox University： ', '')
        title = title.split('｜')[0].strip()

        segments = parse_vtt(f)
        data = extract_quest_data(segments, title)
        data["file"] = basename
        data["segments"] = len(segments)
        total_steps += len(data["steps"])
        all_data.append(data)

        if data["steps"]:
            print(f"  [{len(data['steps']):3d} steps] {title[:60]}")

    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_file = os.path.join(OUTPUT_DIR, "parsed_quest_data.json")
    with open(out_file, 'w') as f:
        json.dump(all_data, f, indent=2)

    print(f"\nTotal: {len(all_data)} videos, {total_steps} walkthrough steps")
    print(f"Saved to: {out_file}")


if __name__ == "__main__":
    main()

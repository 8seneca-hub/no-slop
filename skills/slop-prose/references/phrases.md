# Phrases

Banned or often empty. "Often empty" means: cut it unless the sentence loses a fact. A quote or a code sample is not a hit. The linter reads the same lists from `scripts/rules/phrases.en.json`; this file adds the judgment.

## Throat-clearing (NS-P-02)

Announces content instead of giving it. Delete and start at the claim.

- here's the thing, here's the kicker, let me be clear, let's be honest
- let's dive in, let's unpack, without further ado, buckle up, picture this
- it's worth noting, it's important to note, it goes without saying, needless to say
- at the end of the day, when it comes to, make no mistake, the truth is, the reality is
- in today's fast-paced world, in today's digital landscape, in this article we will

## Faux-insight (NS-P-06)

Promises a revelation and delays it.

- here's what most people miss, what nobody tells you, the real question is
- and that's the point, think about it, let that sink in, full stop, plain and simple
- the uncomfortable truth

## Emphasis crutches (NS-P-03)

Intensifiers that add heat, not information. Replace with the fact that earns the emphasis.

- truly, genuinely, incredibly, utterly, quite frankly, without a doubt, to be honest
- game-changer, in a very real sense, absolutely, deeply (when it modifies nothing)

## Business jargon (NS-P-16)

- leverage (as a verb), synergy, paradigm shift, move the needle, low-hanging fruit
- circle back, deep dive, unlock the power, best-in-class, world-class, cutting-edge
- robust, seamless, holistic, end-to-end, streamline, empower, turnkey, mission-critical
- take it to the next level, revolutionize, supercharge, elevate your

Fix: say the action. "Leverage our data" becomes "use our data".

## Puffery (NS-P-17)

Inflates importance. Keep the fact, drop the glow.

- rich tapestry, testament to, plays a crucial/vital/pivotal role, ever-evolving
- navigate the complexities, in the realm of, delve into, a myriad of
- underscores/highlights the importance of, beacon of, nestled, vibrant, bustling

## Weasel attribution (NS-P-18)

A claim with no owner. Name the source or drop it.

- experts say, studies show, research shows, many believe, some argue
- it is widely believed, it is well known, industry experts, critics say, observers note

## Hedging (NS-P-19)

One hedge where the doubt is real is honest. A stack is evasion.

- it could be argued, it seems that, may potentially, might possibly
- in some ways, to some extent, arguably, tends to (when always meant)

## Meta-commentary (NS-P-20)

Text describing itself or steering the reader.

- in conclusion, in summary, to sum up, as mentioned above, as we'll see
- this section will, the rest of this essay, as previously stated, let me explain

## Padding (NS-P-23)

- in order to (to), due to the fact that (because), at this point in time (now)
- a number of (several or the number), basically, essentially, simply, just (when it softens)

## Stock transitions (NS-P-14)

- moreover, furthermore, additionally, in addition, however (three in a page)

## Chatbot residue (NS-P-25, Hard)

- as an AI language model, I hope this helps, great question, I'd be happy to help
- feel free to reach out, let me know if you'd like, certainly, here is

## Often fine

A common word is not slop by being common. Do not flag "important", "key", "really" or "just" in plain speech, in a quote, or where the author uses them as habit (see `voice.md`).

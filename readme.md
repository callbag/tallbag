# Tallbag

> A Callbag-compatible spec that adds introspection data

![Tallbag logo](./tallbag.png)

* Functionally the same as callbags
* Tallbags can interoperate with callbags, and vice-versa
* Tallbags deliver **data**, but also generate **shadow callbags** which deliver **metadata**

The motivation for Tallbag is to provide a mechanism for creating and delivering metadata concerning any chain of Callbag operators. Such metadata can then be used by (visual) developer tools, for instance to display a graph of the chain of operators.

Because it seemed unlikely that plain callbags could support delivering metadata, a new spec was created. However, this has very few differences with Callbag, and is fully compatible with Callbag.

## Summary

* Upon greeting, tallbags accept a 3rd (optional) argument: a shadow callbag
* Shadow callbags are regular callbag sources that deliver metadata about the chain of tallbags
* Every tallbag is a callbag
* Every callbag works as a tallbag (where the third greeting argument is missing)

## Specification

**`(type: number, payload?: any, shadow?: Callbag) => void`**

### Definitions

- *Tallbag*: a function of signature (TypeScript syntax:) `(type: 0 | 1 | 2, payload?: any) => void`
- *Greet*: if a tallbag is called with `0` as the first argument, we say "the tallbag is greeted", while the code which performed the call "greets the tallbag"
- *Deliver*: if a tallbag is called with `1` as the first argument, we say "the tallbag is delivered data", while the code which performed the call "delivers data to the tallbag"
- *Terminate*: if a tallbag is called with `2` as the first argument, we say "the tallbag is terminated", while the code which performed the call "terminates the tallbag"
- *Source*: a tallbag which is expected to deliver data
- *Sink*: a tallbag which is expected to be delivered data

### Protocol

The capitalized keywords used here follow [IETF's RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

**Greets**: `(type: 0, cb: Tallbag, shadow?: Callbag) => void`

A tallbag is *greeted* when the first argument is `0` and the second argument is another tallbag (a function). **The third argument is an optional callbag, known as the _shadow callbag_.**

**Handshake**

When a source is greeted and given a sink as payload, the sink MUST be greeted back with a tallbag payload that is either the source itself or another tallbag (known as the "talkback"). In other words, greets are mutual. Reciprocal greeting is called a *handshake*.

**Termination**: `(type: 2, err?: any) => void`

A tallbag is *terminated* when the first argument is `2` and the second argument is either undefined (signalling termination due to success) or any truthy value (signalling termination due to failure).

After the handshake, the source MAY terminate the sink. Alternatively, the sink MAY terminate the source after the handshake has occurred. If the source terminates the sink, then the sink SHOULD NOT terminate the source, and vice-versa. In other words, termination SHOULD NOT be mutual.

**Data delivery** `(type: 1, data: any) => void`

Amount of deliveries:

- A tallbag (either sink or source) MAY be delivered data, once or multiple times

Window of valid deliveries:

- A tallbag MUST NOT be delivered data before it has been greeted
- A tallbag MUST NOT be delivered data after it has been terminated
- A sink MUST NOT be delivered data after it terminates its source

**Reserved codes**

A tallbag SHOULD NOT be called with any of these numbers as the first argument: `3`, `4`, `5`, `6`, `7`, `8`, `9`. Those are called *reserved codes*. A tallbag MAY be called with codes other than those in the range `[0-9]`, but this specification makes no claims in those cases.

## Legal

This project is offered to the Public Domain in order to allow free use by interested parties who want to create compatible implementations. For details see `COPYING` and `CopyrightWaivers.txt`.

<p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
  <a rel="license" href="http://creativecommons.org/publicdomain/zero/1.0/">
    <img src="http://i.creativecommons.org/p/zero/1.0/88x31.png" style="border-style: none;" alt="CC0" />
  </a>
  <br />
  To the extent possible under law,
  <a rel="dct:publisher" href="https://github.com/callbag/tallbag/blob/master/CopyrightWaivers.txt">
    <span property="dct:title">Tallbag Standard Special Interest Group</span></a>
  has waived all copyright and related or neighboring rights to
  <span property="dct:title">Tallbag Standard</span>.
  This work is published from:
  <span property="vcard:Country" datatype="dct:ISO3166" content="FI" about="http://github.com/callbag/tallbag">Finland</span>.
</p>

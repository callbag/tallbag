# Usage

## How to use tallbags

When running in production, tallbags are exactly the same as callbags, both in behavior and in usage. The only practical difference is that the imports may change.

```diff
-const {forEach, interval, map, filter, take, pipe} = require('callbag-basics');
+const {forEach, interval, map, filter, take, pipe} = require('tallbag-basics');

pipe(
  interval(1000),
  map(x => x + 1),
  filter(x => x % 2),
  take(5),
  forEach(x => console.log(x))
);
```

When running in development, tallbags produce data for developer tools, which can help you debug your code. That's how easy it is to use tallbags, if you're already familiar with callbags.

## Mixing callbags and tallbags

You can also mix and match callbag libraries with tallbags libraries, in production there should be no visible difference. The code below works as you would expect:

```diff
 const {forEach, interval, map, take, pipe} = require('callbag-basics');
+const filter = require('tallbag-filter');

 pipe(
   interval(1000),
   map(x => x + 1),
+  filter(x => x % 2),
   take(5),
   forEach(x => console.log(x))
 );
```

When running in development, the devtools that depend on metadata from the tallbags will be missing data for every callbag that was included. That's the only downside of mixing these two.

## How to create Tallbag libraries

A shadow callbag can be (according to the Tallbag spec) any callbag, but in practice most libraries should use a default shadow implementation which collects operator chain metadata as JSON. This is what the module `shadow-callbag` is for. It comes with one utility: `makeShadow()`.

When implementing a Tallbag library, it's useful to start from a Callbag library implementation, and adapt it. You could do this as fork. The implementation is slightly different for operators and for factories (creation operators).

### Source factories

To add a shadow callbag to a source factory (a.k.a. creation operator):

- Import/require `makeShadow` from `shadow-callbag`
- In the source factory, create `const shadow = makeShadow('my-library')`
- When your source greets the sink, pass the `shadow` as the 3rd argument
- Whenever the source is going to deliver data to the sink, also deliver that same data to the shadow: `shadow(1, data)`

See example below, where we convert `callbag-interval` to `tallbag-interval`:

```diff
+const makeShadow = require('shadow-callbag').default;

 const interval = period => (start, sink) => {
   if (start !== 0) return;
   let i = 0;
+  const shadow = makeShadow('interval');
   const id = setInterval(() => {
+    shadow(1, i);
     sink(1, i);
     i++;
   }, period);
   function talkback(t) {
     if (t === 2) clearInterval(id);
   }
-  sink(0, talkback);
+  sink(0, talkback, shadow);
 };
```

### Operators

Adding a shadow callbag to an tallbag operator is similar to source factories, but this time you have to handle **two shadows**: the shadow coming from above, and the shadow to be given downwards.

- Import/require `makeShadow` from `shadow-callbag`
- When the source greets the operator, create `const shadow = makeShadow('my-library', shadowFromAbove)`
- When the operator greets the sink, pass the `shadow` as the 3rd argument
- Whenever the operator is going to deliver data to the sink, also deliver that same data to the shadow: `shadow(1, data)`

In the example below, we convert `callbag-filter` to `tallbag-filter`. The shadow coming from above is `s`, and the shadow sent downwards is `shadow`.

```diff
+const makeShadow = require('shadow-callbag').default;

 const filter = condition => source => (start, sink) => {
   if (start !== 0) return;
   let talkback;
-  source(0, (t, d) => {
+  let shadow;
+  source(0, (t, d, s) => {
     if (t === 0) {
+      shadow = makeShadow('filter', s);
       talkback = d;
-      sink(0, talkback);
+      sink(0, talkback, shadow);
     } else if (t === 1) {
-      if (condition(d)) sink(t, d);
+      if (condition(d)) {
+        shadow(t, d);
+        sink(t, d);
+      }
       else talkback(1);
     }
     else sink(t, d);
   });
 };
```

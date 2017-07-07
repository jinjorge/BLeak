import {StackFrame} from 'error-stack-parser';

/**
 * Contains information on a source file.
 */
export interface SourceFile {
  url: string;
  mimetype: string;
  contents: string;
}

export interface IProxyConstructor<T extends IProxy> {
  listen(port: number): PromiseLike<T>;
}

export interface IProxy {
  /**
   * Register a function that can rewrite *text* files requested over the network.
   */
  onRequest(cb: (f: SourceFile) => SourceFile): void;
  getHTTPPort(): number;
  getHTTPSPort(): number;
  getHost(): string;
  shutdown(): PromiseLike<void>;
}

/**
 * Drives the browser on behalf of Deuterium Oxide.
 */
export interface IBrowserDriver {
  /**
   * Navigates to the given URL. Invokes promise once page loads.
   */
  navigateTo(url: string): PromiseLike<any>;
  /**
   * Evals the given code on the webpage, and returns result as a string.
   */
  runCode(code: string): PromiseLike<string>;
  /**
   * Takes a heap snapshot of the current webpage.
   */
  takeHeapSnapshot(): PromiseLike<HeapSnapshot>;
}

/**
 * A Deuterium Oxide configuration file.
 */
export interface ConfigurationFile {
  // URL to web page to check for memory leaks.
  url: string;
  // (Optional) Globs for script files that should be *black boxed* during leak detection.
  blackBox?: string[];
  // Runs your program in a loop. Each step has a "check" function, and a "next" function
  // to transition to the next step in the loop.
  // Deuterium oxide assumes your program is in the first step when it navigates to the URL,
  // and that the last step transitions to the first step.
  loop: Step[];
  // (Optional) How long to wait for a step transition to finish before declaring an error.
  timeout?: number;
}

/**
 * A stage in an application loop.
 */
export interface Step  {
  // (Optional) Name for debugging purposes.
  name?: string;
  // Return 'true' if the program has finished loading the current state
  check: () => boolean | PromiseLike<boolean>;
  // Transitions to the next step.
  next: () => null | undefined | PromiseLike<void>;
}

/**
 * Represents a leak in the application.
 * (For now.)
 */
export interface Leak {
  path: string;
  newProperties: {[prop: string]: StackFrame[][]};
}

/**
 * Chrome heap snapshot.
 */
export interface HeapSnapshot {
  snapshot: HeapSnapshotContents;
  nodes: number[];
  edges: number[];
  trace_function_info: any[];
  trace_tree: any[];
  samples: any[];
  strings: string[];
}

export interface HeapSnapshotContents {
  meta: HeapSnapshotMeta;
  node_count: number;
  edge_count: number;
  trace_function_count: number;
}

export interface HeapSnapshotMeta {
  node_fields: string[];
  node_types: (string | string[])[];
  edge_fields: string[];
  edge_types: (string | string[])[];
  trace_function_info_fields: string[];
  trace_node_fields: string[];
  sample_fields: string[];
}

/**
 * The type of a heap snapshot edge.
 * Copied from `v8-profiler.h`.
 */
export const enum SnapshotEdgeType {
  ContextVariable = 0,  // A variable from a function context.
  Element = 1,          // An element of an array.
  Property = 2,         // A named object property.
  Internal = 3,         // A link that can't be accessed from JS,
                        // thus, its name isn't a real property name
                        // (e.g. parts of a ConsString).
  Hidden = 4,           // A link that is needed for proper sizes
                        // calculation, but may be hidden from user.
  Shortcut = 5,         // A link that must not be followed during
                        // sizes calculation.
  Weak = 6              // A weak reference (ignored by the GC).
}

export function SnapshotEdgeTypeToString(se: SnapshotEdgeType): string {
  switch (se) {
    case SnapshotEdgeType.ContextVariable:
      return "ContextVariable";
    case SnapshotEdgeType.Element:
      return "Element";
    case SnapshotEdgeType.Hidden:
      return "Hidden";
    case SnapshotEdgeType.Internal:
      return "Internal";
    case SnapshotEdgeType.Property:
      return "Property";
    case SnapshotEdgeType.Shortcut:
      return "Shortcut";
    case SnapshotEdgeType.Weak:
      return "Weak";
    default:
      return "(Unknown)";
  }
}

/**
 * The type of a heap snapshot node.
 * Copied from `v8-profiler.h`.
 */
export const enum SnapshotNodeType {
  Hidden = 0,         // Hidden node, may be filtered when shown to user.
  Array = 1,          // An array of elements.
  String = 2,         // A string.
  Object = 3,         // A JS object (except for arrays and strings).
  Code = 4,           // Compiled code.
  Closure = 5,        // Function closure.
  RegExp = 6,         // RegExp.
  HeapNumber = 7,     // Number stored in the heap.
  Native = 8,         // Native object (not from V8 heap).
  Synthetic = 9,      // Synthetic object, usualy used for grouping
                      // snapshot items together.
  ConsString = 10,    // Concatenated string. A pair of pointers to strings.
  SlicedString = 11,  // Sliced string. A fragment of another string.
  Symbol = 12,        // A Symbol (ES6).
  Unresolved = 15     // (Internal) Not resolved yet.
}

export function SnapshotNodeTypeToString(sn: SnapshotNodeType): string {
  switch (sn) {
    case SnapshotNodeType.Array:
      return "Array";
    case SnapshotNodeType.Closure:
      return "Closure";
    case SnapshotNodeType.Code:
      return "Code";
    case SnapshotNodeType.ConsString:
      return "ConsString";
    case SnapshotNodeType.HeapNumber:
      return "HeapNumber";
    case SnapshotNodeType.Hidden:
      return "Hidden";
    case SnapshotNodeType.Native:
      return "Native";
    case SnapshotNodeType.Object:
      return "Object";
    case SnapshotNodeType.RegExp:
      return "RegExp";
    case SnapshotNodeType.SlicedString:
      return "SlicedString";
    case SnapshotNodeType.String:
      return "String";
    case SnapshotNodeType.Symbol:
      return "Symbol";
    case SnapshotNodeType.Synthetic:
      return "Synthetic";
    case SnapshotNodeType.Unresolved:
      return "Unresolved";
    default:
      return "(Unknown";
  }
}
/**
 * A small replacement for `react-intl`. Messages use the ICU MessageFormat subset
 * Chonky needs: `{arg}`, `{arg, plural, ...}`, `{arg, selectordinal, ...}`,
 * `{arg, select, ...}`, `#` inside plurals, `{arg, number|date|time[, style]}` and
 * apostrophe quoting. Formatting of numbers, dates and plurals is done by the
 * browser's `Intl` APIs.
 */
import { createElement, Fragment, ReactNode } from 'react';

export type MessageValue = string | number | boolean | Date | null | undefined;

export interface MessageDescriptor {
    id: string;
    defaultMessage?: string;
}

export interface ChonkyIntl {
    locale: string;
    formatMessage(descriptor: MessageDescriptor, values?: Record<string, MessageValue>): string;
    formatMessage(descriptor: MessageDescriptor, values?: Record<string, MessageValue | ReactNode>): ReactNode;
    formatDate(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
    formatTime(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
    formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
}

export interface ChonkyIntlConfig {
    /** BCP 47 language tag, e.g. `en` or `fa-IR`. Defaults to `en`. */
    locale?: string;
    /**
     * Locale of the default (untranslated) messages. They are formatted with this
     * locale's plural rules and number format. Defaults to `en`.
     */
    defaultLocale?: string;
    /** Translated messages, keyed by message ID (see `getI18nId`). */
    messages?: Record<string, string>;
    /** Time zone used to format dates, e.g. `Asia/Tehran`. Defaults to the user's. */
    timeZone?: string;
}

// ---- Parsing ----

type MessageNode =
    | string
    | { type: 'pound' }
    | { type: 'argument'; name: string }
    | { type: 'format'; name: string; format: string; style: string }
    | { type: 'plural'; name: string; ordinal: boolean; offset: number; options: Record<string, MessageNode[]> }
    | { type: 'select'; name: string; options: Record<string, MessageNode[]> };

const parseMessage = (message: string): MessageNode[] => {
    let i = 0;

    const fail = (reason: string): never => {
        throw new Error(`${reason} at position ${i} in message "${message}"`);
    };
    const skipWhitespace = () => {
        while (i < message.length && /\s/.test(message[i]!)) i++;
    };
    const readUntil = (stopChars: RegExp) => {
        const start = i;
        while (i < message.length && !stopChars.test(message[i]!)) i++;
        return message.slice(start, i);
    };

    const parseNodes = (inPlural: boolean): MessageNode[] => {
        const nodes: MessageNode[] = [];
        let text = '';
        const flushText = () => {
            if (text) nodes.push(text);
            text = '';
        };

        while (i < message.length) {
            const char = message[i]!;
            if (char === '}') break;
            if (char === '{') {
                flushText();
                nodes.push(parseArgument(inPlural));
            } else if (char === '#' && inPlural) {
                flushText();
                nodes.push({ type: 'pound' });
                i++;
            } else if (char === "'" && message[i + 1] === "'") {
                // `''` is a literal apostrophe.
                text += "'";
                i += 2;
            } else if (char === "'" && /[{}]/.test(message[i + 1] ?? '')) {
                // `'{...}'` is quoted literal text.
                const end = message.indexOf("'", i + 1);
                text += message.slice(i + 1, end === -1 ? undefined : end);
                i = end === -1 ? message.length : end + 1;
            } else if (char === "'" && inPlural && message[i + 1] === '#') {
                text += '#';
                i = message[i + 2] === "'" ? i + 3 : i + 2;
            } else {
                text += char;
                i++;
            }
        }
        flushText();
        return nodes;
    };

    const parseArgument = (inPlural: boolean): MessageNode => {
        i++; // `{`
        const name = readUntil(/[,}]/).trim();
        if (message[i] === '}') {
            i++;
            return { type: 'argument', name };
        }
        i++; // `,`
        const format = readUntil(/[,}]/).trim();
        if (message[i] === '}') {
            i++;
            return { type: 'format', name, format, style: '' };
        }
        i++; // `,`

        if (format === 'plural' || format === 'selectordinal' || format === 'select') {
            const isPlural = format !== 'select';
            const options: Record<string, MessageNode[]> = {};
            let offset = 0;
            for (;;) {
                skipWhitespace();
                if (i >= message.length) fail('Unclosed argument');
                if (message[i] === '}') break;
                const key = readUntil(/[\s{}]/);
                if (!key) fail('Expected an option name');
                if (key.startsWith('offset:')) {
                    offset = Number(key.slice('offset:'.length)) || 0;
                    continue;
                }
                skipWhitespace();
                if (message[i] !== '{') fail(`Expected "{" after option "${key}"`);
                i++;
                options[key] = parseNodes(inPlural || isPlural);
                if (message[i] !== '}') fail(`Unclosed option "${key}"`);
                i++;
            }
            i++; // `}`
            if (!options.other) fail(`Argument "${name}" has no "other" option`);
            return isPlural
                ? { type: 'plural', name, ordinal: format === 'selectordinal', offset, options }
                : { type: 'select', name, options };
        }

        const style = readUntil(/}/).trim();
        if (message[i] !== '}') fail('Unclosed argument');
        i++;
        return { type: 'format', name, format, style };
    };

    const nodes = parseNodes(false);
    if (i < message.length) fail('Unexpected "}"');
    return nodes;
};

const parsedMessageCache = new Map<string, MessageNode[] | Error>();
const getParsedMessage = (message: string) => {
    let parsed = parsedMessageCache.get(message);
    if (!parsed) {
        try {
            parsed = parseMessage(message);
        } catch (error) {
            parsed = error as Error;
            console.error(`[chonky2] Could not parse message. ${parsed.message}`);
        }
        parsedMessageCache.set(message, parsed);
    }
    return parsed;
};

// ---- Formatting ----

const isValidLocale = (locale: string) => {
    try {
        return Intl.DateTimeFormat.supportedLocalesOf(locale).length > 0;
    } catch {
        return false;
    }
};

const toDate = (value: Date | number | string) => (value instanceof Date ? value : new Date(value));

const dateStyles = ['short', 'medium', 'long', 'full'];

export const createChonkyIntl = (config: ChonkyIntlConfig = {}): ChonkyIntl => {
    const getValidLocale = (value: string | undefined) => (value && isValidLocale(value) ? value : 'en');
    const locale = getValidLocale(config.locale);
    const defaultLocale = getValidLocale(config.defaultLocale);
    const messages = config.messages ?? {};
    const timeZone = config.timeZone;

    const formatterCache = new Map<string, any>();
    const cached = <T>(key: string, create: () => T): T => {
        let formatter = formatterCache.get(key);
        if (!formatter) formatterCache.set(key, (formatter = create()));
        return formatter;
    };
    const getNumberFormat = (options?: Intl.NumberFormatOptions, loc = locale) =>
        cached(`n${loc}${JSON.stringify(options)}`, () => new Intl.NumberFormat(loc, options));
    const getDateFormat = (options?: Intl.DateTimeFormatOptions, loc = locale) =>
        cached(`d${loc}${JSON.stringify(options)}`, () => new Intl.DateTimeFormat(loc, { timeZone, ...options }));
    const getPluralRules = (ordinal: boolean, loc: string) =>
        cached(`p${loc}${ordinal}`, () => new Intl.PluralRules(loc, { type: ordinal ? 'ordinal' : 'cardinal' }));

    const formatArgument = (
        node: Extract<MessageNode, { type: 'format' }>,
        value: unknown,
        loc: string
    ): ReactNode => {
        const style = dateStyles.includes(node.style) ? (node.style as 'short') : 'medium';
        if (node.format === 'number' && typeof value === 'number') {
            if (node.style === 'percent') return getNumberFormat({ style: 'percent' }, loc).format(value);
            if (node.style === 'integer') return getNumberFormat({ maximumFractionDigits: 0 }, loc).format(value);
            return getNumberFormat(undefined, loc).format(value);
        }
        if (node.format === 'date' && value !== null && value !== undefined) {
            return getDateFormat({ dateStyle: style }, loc).format(toDate(value as Date));
        }
        if (node.format === 'time' && value !== null && value !== undefined) {
            return getDateFormat({ timeStyle: style }, loc).format(toDate(value as Date));
        }
        return value as ReactNode;
    };

    const formatNodes = (
        nodes: MessageNode[],
        values: Record<string, unknown>,
        loc: string,
        parts: ReactNode[],
        pluralValue: number | null
    ) => {
        for (const node of nodes) {
            if (typeof node === 'string') {
                parts.push(node);
            } else if (node.type === 'pound') {
                parts.push(pluralValue === null ? '#' : getNumberFormat(undefined, loc).format(pluralValue));
            } else if (node.type === 'argument') {
                parts.push(values[node.name] as ReactNode);
            } else if (node.type === 'format') {
                parts.push(formatArgument(node, values[node.name], loc));
            } else if (node.type === 'plural') {
                const value = Number(values[node.name]);
                const option =
                    node.options[`=${value}`] ??
                    node.options[getPluralRules(node.ordinal, loc).select(value - node.offset)] ??
                    node.options.other!;
                formatNodes(option, values, loc, parts, value - node.offset);
            } else {
                const option = node.options[String(values[node.name])] ?? node.options.other!;
                formatNodes(option, values, loc, parts, pluralValue);
            }
        }
    };

    const formatMessage = (
        descriptor: MessageDescriptor,
        values: Record<string, unknown> = {}
    ): any => {
        // Untranslated messages fall back to the default message, which is written for
        // `defaultLocale` and so is formatted with that locale's rules.
        const translated = messages[descriptor.id];
        const message = translated ?? descriptor.defaultMessage ?? descriptor.id;
        const parsed = getParsedMessage(message);
        if (parsed instanceof Error) return message;

        const parts: ReactNode[] = [];
        formatNodes(parsed, values, translated === undefined ? defaultLocale : locale, parts, null);
        const isPlainText = parts.every(
            (part) => part === null || part === undefined || typeof part !== 'object'
        );
        if (isPlainText) return parts.map((part) => (part === null || part === undefined ? '' : String(part))).join('');
        return createElement(Fragment, null, ...parts);
    };

    return {
        locale,
        formatMessage,
        formatDate: (value, options) => getDateFormat(options).format(toDate(value)),
        formatTime: (value, options) =>
            getDateFormat(options ?? { hour: 'numeric', minute: 'numeric' }).format(toDate(value)),
        formatNumber: (value, options) => getNumberFormat(options).format(value),
    };
};

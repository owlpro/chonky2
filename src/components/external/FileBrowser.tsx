import React, { ReactNode, useId, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider as ReduxProvider } from 'react-redux';

import { useChonkyStore } from '../../redux/store';
import { FileBrowserHandle, FileBrowserProps } from '../../types/file-browser.types';
import { defaultConfig } from '../../util/default-config';
import { getValueOrFallback } from '../../util/helpers';
import { useStaticValue } from '../../util/hooks-helpers';
import { ChonkyFormattersContext, ChonkyIntlContext, defaultFormatters } from '../../util/i18n';
import { createChonkyIntl } from '../../util/intl';
import { ChonkyIconContext } from '../../util/icon-helper';
import { ChonkyDarkModeContext, useChonkyStyles } from '../../util/styles';
import { ChonkyBusinessLogic } from '../internal/ChonkyBusinessLogic';
import { ChonkyIconPlaceholder } from '../internal/ChonkyIconPlaceholder';
import { ChonkyPresentationLayer } from '../internal/ChonkyPresentationLayer';

export const FileBrowser = React.forwardRef<
    FileBrowserHandle,
    FileBrowserProps & { children?: ReactNode }
>((props, ref) => {
    const { instanceId, iconComponent, children } = props;
    const disableDragAndDrop = getValueOrFallback(
        props.disableDragAndDrop,
        defaultConfig.disableDragAndDrop,
        'boolean'
    );
    const disableDragAndDropProvider = getValueOrFallback(
        props.disableDragAndDropProvider,
        defaultConfig.disableDragAndDropProvider,
        'boolean'
    );
    const darkMode = getValueOrFallback(
        props.darkMode,
        defaultConfig.darkMode,
        'boolean'
    );
    const i18n = getValueOrFallback(props.i18n, defaultConfig.i18n);
    const formatters = useMemo(
        () => ({ ...defaultFormatters, ...i18n?.formatters }),
        [i18n]
    );
    const intl = useMemo(
        () =>
            createChonkyIntl({
                locale: i18n?.locale,
                defaultLocale: i18n?.defaultLocale,
                messages: i18n?.messages,
                timeZone: i18n?.timeZone,
            }),
        [i18n?.locale, i18n?.defaultLocale, i18n?.messages, i18n?.timeZone]
    );

    const generatedInstanceId = useId();
    const chonkyInstanceId = useStaticValue(() => instanceId ?? generatedInstanceId);
    const store = useChonkyStore(chonkyInstanceId);

    useChonkyStyles();

    const chonkyComps = (
        <>
            <ChonkyBusinessLogic ref={ref} {...props} />
            <ChonkyPresentationLayer>{children}</ChonkyPresentationLayer>
        </>
    );

    return (
        <ChonkyIntlContext.Provider value={intl}>
            <ChonkyFormattersContext.Provider value={formatters}>
                <ReduxProvider store={store}>
                    <ChonkyDarkModeContext.Provider value={darkMode}>
                        <ChonkyIconContext.Provider
                            value={
                                iconComponent ??
                                defaultConfig.iconComponent ??
                                ChonkyIconPlaceholder
                            }
                        >
                            {disableDragAndDrop || disableDragAndDropProvider ? (
                                chonkyComps
                            ) : (
                                <DndProvider backend={HTML5Backend}>
                                    {chonkyComps}
                                </DndProvider>
                            )}
                        </ChonkyIconContext.Provider>
                    </ChonkyDarkModeContext.Provider>
                </ReduxProvider>
            </ChonkyFormattersContext.Provider>
        </ChonkyIntlContext.Provider>
    );
});

FileBrowser.displayName = 'FileBrowser';

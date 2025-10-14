import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    margins: {
      rootLayoutMargin: number;
    };
    fontSizes: {
      rootPrimary: number;
    };
    toolbar: {
      size: number;
      lineHeight: string;
      fontSize: number;
      buttonRadius: number;
    };
    dnd: {
      canDropColor: string;
      cannotDropColor: string;
      canDropMask: string;
      cannotDropMask: string;
      fileListCanDropMaskOne: string;
      fileListCanDropMaskTwo: string;
      fileListCannotDropMaskOne: string;
      fileListCannotDropMaskTwo: string;
    };
    gridFileEntry: {
      childrenCountSize: string;
      iconColorFocused: string;
      iconSize: string;
      iconColor: string;
      borderRadius: number;
      fontSize: number;
      fileColorTint: string;
      folderBackColorTint: string;
      folderFrontColorTint: string;
    };
    listFileEntry: {
      propertyFontSize: number;
      iconFontSize: string;
      iconBorderRadius: number;
      fontSize: number;
    };
  }

  // برای اینکه موقع ساخت تم خطا نده
  interface ThemeOptions {
    margins?: Partial<Theme["margins"]>;
    fontSizes?: Partial<Theme["fontSizes"]>;
    toolbar?: Partial<Theme["toolbar"]>;
    dnd?: Partial<Theme["dnd"]>;
    gridFileEntry?: Partial<Theme["gridFileEntry"]>;
    listFileEntry?: Partial<Theme["listFileEntry"]>;
  }
}
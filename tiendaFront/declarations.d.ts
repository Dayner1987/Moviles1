declare module '@react-native-picker/picker' {
  import { Component } from 'react';
    import { StyleProp, ViewProps, ViewStyle } from 'react-native';

  export class Picker extends Component<PickerProps> {
    static Item: typeof PickerItem; // 👈 importante para que Picker.Item funcione
  }

  export interface PickerProps extends ViewProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    style?: StyleProp<ViewStyle>;
    mode?: 'dialog' | 'dropdown';
  }

  export class PickerItem extends Component<PickerItemProps> {}

  export interface PickerItemProps {
    label: string;
    value: any;
    color?: string;
    testID?: string;
  }
}

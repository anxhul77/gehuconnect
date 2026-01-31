import { Shadow } from 'react-native-shadow-2';
import { Text, View } from 'react-native';

export const NeumorphicButton = () => {
  return (
    <Shadow
      distance={10}
      startColor={'#dddddd'}
      endColor={'#ffffff'}
      offset={[5, 5]}
      paintInside
      // ... other shadow props for the second shadow ...
      style={{
        borderRadius: 20,
        backgroundColor: '#ECF0F3', // Match background color for the effect
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Neumorphic</Text>
    </Shadow>
  );
};
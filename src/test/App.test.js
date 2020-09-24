import React, { Component } from "react";
import App from "../client/app";
import * as redux from "react-redux";
import Enzyme, { shallow, render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Adapter from "enzyme-adapter-react-16";
// import * as components from "../client/components/basicComponents";
// import * as propComponents from "../client/components/propComponents";

Enzyme.configure({ adapter: new Adapter() });
it("renders correctly enzyme", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockReturnValue("Soon, will be here a fantastic Tetris ...");
  const wrapper = mount(<App />);
  expect(toJson(wrapper)).toMatchSnapshot();
});

// Object.keys(components).forEach((componentName) => {
//   const Component = components[componentName];
//   describe(`Component: ${componentName}`, () => {
//     test(`${componentName} renders with default props`, () => {
//       const wrapper = shallow(<Component />);
//       expect(wrapper).toMatchSnapshot();
//     });
//   });
// });

// Object.keys(propComponents).forEach((componentName) => {
//   let Component = propComponents[componentName];
//   Component.propsToTest.map((prop) => {
//     describe(`Component: ${componentName}`, () => {
//       test(`${componentName} renders with prop ${prop}`, () => {
//         const wrapper = shallow(<Component />);
//         let props = {};
//         Object.entries(prop).map(([propName, propValue]) => {
//           props[`${propName}`] = propValue;
//         });
//         wrapper.setProps(props);
//         expect(wrapper).toMatchSnapshot();
//       });
//     });
//   });
// });

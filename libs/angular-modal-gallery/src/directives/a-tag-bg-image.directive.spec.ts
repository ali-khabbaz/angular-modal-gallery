/*
 The MIT License (MIT)

 Copyright (c) 2017-2018 Stefano Cappa (Ks89)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ATagBgImageDirective } from './a-tag-bg-image.directive';
import { Image } from '../model/image.class';

const expectedModal: any[] = [
  {image: new Image(0, {img: 'path'}), style: '50% 50% / cover'},
  {image: new Image(0, {img: 'path'}), style: ''}
];

const expectedPlain: any[] = [
  {image: new Image(1, {img: 'path'}, {img: 'plainPath'}), style: '50% 50% / cover'},
  {image: new Image(1, {img: 'path'}, {img: 'plainPath'}), style: ''}
];

const expectedWrongPlain: any[] = [
  {image: new Image(2, {img: 'path'}, {img: null}), style: '50% 50% / cover'},
  {image: new Image(3, {img: 'path'}, {img: undefined}), style: '50% 50% / cover'}
];

const expectedWithNoImages: any[] = [
  {image: null, style: '50% 50% / cover'},
  {image: null, style: ''},
  {image: undefined, style: '50% 50% / cover'},
  {image: undefined, style: ''}
];

const length: number = expectedModal.length + expectedPlain.length + expectedWrongPlain.length + expectedWithNoImages.length;

@Component({
  selector: 'ks-test-atagbgimage',
  template: `
    <div ksATagBgImage [image]="images[0]" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="images[0]" [style]="''"></div>
    <div ksATagBgImage [image]="images[1]" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="images[1]" [style]="''"></div>
    <div ksATagBgImage [image]="images[2]" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="images[3]" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="null" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="null" [style]="''"></div>
    <div ksATagBgImage [image]="undefined" [style]="'50% 50% / cover'"></div>
    <div ksATagBgImage [image]="undefined" [style]="''"></div>
  `
})
class TestATagBgImageComponent {
  images: Image[] = [
    new Image(0, {img: 'path'}),
    new Image(1, {img: 'path'}, {img: 'plainPath'}),
    new Image(2, {img: 'path'}, {img: null}),
    new Image(3, {img: 'path'}, {img: undefined})
  ];
}

let fixture: ComponentFixture<TestATagBgImageComponent>;
let comp: TestATagBgImageComponent;
let des: DebugElement[] = [];
let bareElement: DebugElement;

describe('ATagBgImageDirective', () => {

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [TestATagBgImageComponent, ATagBgImageDirective]
    }); // not necessary with webpack .compileComponents();
    fixture = TestBed.createComponent(TestATagBgImageComponent);
    comp = fixture.componentInstance;

    fixture.detectChanges();
    return fixture.whenStable().then(() => {
      fixture.detectChanges();
      bareElement = fixture.debugElement.query(By.css('div:not(ksATagBgImage)'));
      des = fixture.debugElement.queryAll(By.directive(ATagBgImageDirective));
    });
  });

  it('can instantiate it', () => expect(comp).not.toBeNull());

  describe('---tests---', () => {

    beforeEach(() => fixture.detectChanges());

    it('should have this directive', () => {
      expect(des.length).toBe(length);
    });

    // Different browsers manage this scenario in different ways,
    // for instance, some of them apply default stuff like 'repeat scroll 0% 0%',
    // others prepend 'localhost:port' to the path.
    // So, I decided to use 'toContain', ignoring all other stuff.

    expectedModal.forEach((val: any, index: number) => {
      it(`should check expected results for <main> with an Image (only modal) at position ${index}`, () => {
        // no plain image, only modal
        const path: string = val.image.modal.img;
        const style: string = val.style;
        expect(des[index].nativeElement.style.background).toContain(`url("${path}")`.trim());
        expect(des[index].nativeElement.style.background).toContain(`${style}`.trim());
      });
    });

    expectedPlain.forEach((val: any, index: number) => {
      it(`should check expected results for <main> with an Image (modal + plain) at position ${index}`, () => {
        // when there are both modal and plain, plain wins
        const path: string = val.image.plain.img;
        const style: string = val.style;
        const prevIndex: number = expectedModal.length;
        expect(des[index + prevIndex].nativeElement.style.background).toContain(`url("${path}")`.trim());
        expect(des[index + prevIndex].nativeElement.style.background).toContain(`${style}`.trim());
      });
    });

    expectedWrongPlain.forEach((val: any, index: number) => {
      it(`should check expected results for <main> with an Image (modal + plain without img) at position ${index}`, () => {
        // plain malformed without an img, so modal wins
        const path: string = val.image.modal.img;
        const style: string = val.style;
        const prevIndex: number = +expectedModal.length + expectedPlain.length;
        expect(des[index + prevIndex].nativeElement.style.background).toContain(`url("${path}")`.trim());
        expect(des[index + prevIndex].nativeElement.style.background).toContain(`${style}`.trim());
      });
    });

    expectedWithNoImages.forEach((val: any, index: number) => {
      it(`should check expected results for <main> when input Image is not valid at position ${index}`, () => {
        // no input image
        const style: string = val.style;
        const prevIndex: number = +expectedModal.length + expectedPlain.length + expectedWrongPlain.length;
        expect(des[index + prevIndex].nativeElement.style.background).toBe('');
      });
    });

    it('should check expected results for bare <div> without this directive', () => {
      expect(bareElement.properties['ksATagBgImage']).toBeUndefined();
    });
  });
});

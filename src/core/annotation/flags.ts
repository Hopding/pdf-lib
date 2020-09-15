const flag = (bitIndex: number) => 1 << bitIndex;

/** From PDF spec table 165 */
export enum AnnotationFlags {
  /**
   * If set, do not display the annotation if it does not belong to one of the
   * standard annotation types and no annotation handler is available. If clear,
   * display such an unknown annotation using an appearance stream specified by
   * its appearance dictionary, if any.
   */
  Invisible = flag(1 - 1),

  /**
   * If set, do not display or print the annotation or allow it to interact with
   * the user, regardless of its annotation type or whether an annotation
   * handler is available.
   *
   * In cases where screen space is limited, the ability to hide and show
   * annotations selectively can be used in combination with appearance streams
   * to display auxiliary pop-up information similar in function to online help
   * systems.
   */
  Hidden = flag(2 - 1),

  /**
   * If set, print the annotation when the page is printed. If clear, never
   * print the annotation, regardless of whether it is displayed on the screen.
   *
   * This can be useful for annotations representing interactive pushbuttons,
   * which would serve no meaningful purpose on the printed page.
   */
  Print = flag(3 - 1),

  /**
   * If set, do not scale the annotation’s appearance to match the magnification
   * of the page. The location of the annotation on the page (defined by the
   * upper-left corner of its annotation rectangle) shall remain fixed,
   * regardless of the page magnification.
   */
  NoZoom = flag(4 - 1),

  /**
   * If set, do not rotate the annotation’s appearance to match the rotation of
   * the page. The upper-left corner of the annotation rectangle shall remain in
   * a fixed location on the page, regardless of the page rotation.
   */
  NoRotate = flag(5 - 1),

  /**
   * If set, do not display the annotation on the screen or allow it to interact
   * with the user. The annotation may be printed (depending on the setting of
   * the Print flag) but should be considered hidden for purposes of on-screen
   * display and user interaction.
   */
  NoView = flag(6 - 1),

  /**
   * If set, do not allow the annotation to interact with the user. The
   * annotation may be displayed or printed (depending on the settings of the
   * NoView and Print flags) but should not respond to mouse clicks or change
   * its appearance in response to mouse motions.
   *
   * This flag shall be ignored for widget annotations; its function is
   * subsumed by the ReadOnly flag of the associated form field.
   */
  ReadOnly = flag(7 - 1),

  /**
   * If set, do not allow the annotation to be deleted or its properties
   * (including position and size) to be modified by the user. However, this
   * flag does not restrict changes to the annotation’s contents, such as the
   * value of a form field.
   */
  Locked = flag(8 - 1),

  /**
   * If set, invert the interpretation of the NoView flag for certain events.
   *
   * A typical use is to have an annotation that appears only when a mouse
   * cursor is held over it.
   */
  ToggleNoView = flag(9 - 1),

  /**
   * If set, do not allow the contents of the annotation to be modified by the
   * user. This flag does not restrict deletion of the annotation or changes to
   * other annotation properties, such as position and size.
   */
  LockedContents = flag(10 - 1),
}

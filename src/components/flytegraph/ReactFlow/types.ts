export interface RFWrapperProps {
    rfGraphJson: RFEntity[];
    backgroundStyle: RFBackgroundProps;
    type: RFGraphTypes;
}
export enum RFGraphTypes {
    main,
    nested
}

export interface LayoutRCProps {
    setElements: any;
    setLayout: any;
}

/* React Flow params and styles (background is styles) */
export interface RFBackgroundProps {
    background: any;
    gridColor: string;
    gridSpacing: number;
}

/**
 * Reflects React Flow JSON schema
 * @see https://reactflow.dev/docs/
 */
export interface RFEntity {
    id: string;
    type: string;
    data?: any;
    arrowHeadType?: string;
    sourcePosition?: string;
    targetPosition?: string;
    sourceHandle?: string;
    targetHandle?: string;
    source?: string;
    target?: string;
    __rf?: any;
}


export type ExceptFunction = Exclude<any, Function>;

export interface IResult {
  tag?: string;
  content: ExceptFunction;
}

export let ResultFactory: (object: IResult) => IResult;
ResultFactory = ({
  tag,
  content
}: {
  tag?: IResult['tag'],
  content: IResult['content']
}): IResult => ({
  tag,
  content
});

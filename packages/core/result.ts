
export interface IResult {
  tag?: string;
  content: string;
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

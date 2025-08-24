declare interface UserInterface{
  id: number | string;
  firstname: string;
  othername: string;
  lastname: string;
  datejoined: string;
  imageUrl: string;
}

declare interface UserStateInterface extends User{
  status: "active" | "inactive" | "deleted";
}

declare type User = UserInterface;

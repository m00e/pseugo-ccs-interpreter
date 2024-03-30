func F(c_7 chan int) {

	select {
		case x:=<- c_7: 
			fmt.Println(x);
		case y:=<- c_7:
			fmt.Println(y);
	}
}

func main() {
	c_7 := make(chan int);
	c_8 := make(chan int);
	go F(c_7);
	c_7 <- 5;

	if 5 == 5 {
		fmt.Println(true);
	} else {
		fmt.Println(false);
	}
}
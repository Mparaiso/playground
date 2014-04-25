start:
	@npm start &
commit:
	@git add .
	@git commit -am"$(message) `date`" | :
push: commit
	@git push origin master
.PHONY: start commit push